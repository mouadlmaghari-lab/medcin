<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom_complet'  => ['sometimes', 'required', 'string', 'max:150'],
            'telephone'    => ['sometimes', 'required', 'string', 'max:20'],
            'email'        => ['sometimes', 'email', 'unique:users,email,' . auth()->id()],
            'language'     => ['sometimes', 'string', 'in:fr,ar,en'],
            'notifications_enabled' => ['sometimes', 'boolean'],
        ];
    }
}
