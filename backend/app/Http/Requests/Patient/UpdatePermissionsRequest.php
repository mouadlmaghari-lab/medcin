<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partager_consultations' => ['sometimes', 'boolean'],
            'partager_analyses'      => ['sometimes', 'boolean'],
            'voir_historique'        => ['sometimes', 'boolean'],
        ];
    }
}
