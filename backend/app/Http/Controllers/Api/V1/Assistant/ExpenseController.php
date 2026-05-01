<?php

namespace App\Http\Controllers\Api\V1\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExpenseController extends Controller
{
    /**
     * List expenses (Assistant can manage expenses).
     * GET /api/v1/assistant/expenses?category_id=&fournisseur=&date_from=&date_to=
     */
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

    /**
     * Create expense with receipt upload.
     */
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

    /**
     * Show expense details.
     */
    public function show(Expense $expense): ExpenseResource
    {
        $expense->load('category');

        return new ExpenseResource($expense);
    }

    /**
     * Update expense.
     */
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

    /**
     * Delete expense.
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json(['message' => 'Dépense supprimée.']);
    }
}
