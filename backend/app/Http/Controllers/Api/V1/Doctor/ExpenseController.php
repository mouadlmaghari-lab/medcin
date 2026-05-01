<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExpenseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Expense::query()
            ->with('category')
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->fournisseur, fn ($q, $f) => $q->where('fournisseur', 'like', "%{$f}%"))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_depense', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_depense', '<=', $d))
            ->latest('date_depense');

        return ExpenseResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle receipt upload
        if ($request->hasFile('receipt')) {
            $expense = Expense::create($data);
            $media = $expense->addMediaFromRequest('receipt')
                ->toMediaCollection('receipts');
            $expense->update(['receipt_path' => $media->getPath()]);
        } else {
            $expense = Expense::create($data);
        }

        return (new ExpenseResource($expense->load('category')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Expense $expense): ExpenseResource
    {
        $expense->load('category');

        return new ExpenseResource($expense);
    }

    public function update(StoreExpenseRequest $request, Expense $expense): ExpenseResource
    {
        $data = $request->validated();

        if ($request->hasFile('receipt')) {
            $expense->clearMediaCollection('receipts');
            $media = $expense->addMediaFromRequest('receipt')
                ->toMediaCollection('receipts');
            $data['receipt_path'] = $media->getPath();
        }

        $expense->update($data);

        return new ExpenseResource($expense->fresh()->load('category'));
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->clearMediaCollection('receipts');
        $expense->delete();

        return response()->json(['message' => 'Dépense supprimée.']);
    }

    /**
     * List expense categories for this tenant.
     * GET /api/v1/doctor/expense-categories
     */
    public function categories(): JsonResponse
    {
        $categories = ExpenseCategory::orderBy('nom')->get(['id', 'nom', 'couleur']);

        return response()->json(['data' => $categories]);
    }

    /**
     * Create a new expense category.
     * POST /api/v1/doctor/expense-categories
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'     => ['required', 'string', 'max:100'],
            'couleur' => ['sometimes', 'string', 'max:20'],
        ]);

        $category = ExpenseCategory::create($data);

        return response()->json(['data' => $category], 201);
    }
}
