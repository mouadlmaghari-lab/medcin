<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\Response;

/**
 * AuditMedicalAccess
 *
 * Logs every access to sensitive medical endpoints (consultations, prescriptions,
 * reports, etc.) as required by Moroccan Law 09-08 (data protection) and
 * Law 05-20 (cybersecurity).
 *
 * Records: who accessed what, when, from which IP, and which action.
 */
class AuditMedicalAccess
{
    /**
     * Route name patterns considered sensitive (medical data).
     */
    private array $sensitivePatterns = [
        'consultations',
        'prescriptions',
        'certificates',
        'reports',
        'evolutions',
        'expertises',
        'patients.show',
        'patients.history',
        'pdf.',
        'documents',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful read/write operations (not 4xx/5xx errors)
        if ($response->getStatusCode() >= 400) {
            return $response;
        }

        $this->logAccess($request, $response);

        return $response;
    }

    private function logAccess(Request $request, Response $response): void
    {
        $user = $request->user();
        if (!$user) {
            return;
        }

        $routeName = $request->route()?->getName() ?? '';
        $isSensitive = $this->isSensitiveRoute($routeName);

        // Always log write operations; log reads only for sensitive medical data
        $isWrite = in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE']);
        if (!$isWrite && !$isSensitive) {
            return;
        }

        $action = match ($request->method()) {
            'GET'    => 'viewed',
            'POST'   => 'created',
            'PUT', 'PATCH' => 'updated',
            'DELETE' => 'deleted',
            default  => 'accessed',
        };

        // Extract the subject from route parameters (patient_id, consultation, etc.)
        $subjectInfo = $this->extractSubject($request);

        activity('medical_access')
            ->causedBy($user)
            ->withProperties([
                'action'     => $action,
                'method'     => $request->method(),
                'url'        => $request->fullUrl(),
                'route'      => $routeName,
                'ip'         => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 200),
                'subject'    => $subjectInfo,
                'status'     => $response->getStatusCode(),
            ])
            ->log("{$action} {$routeName}");
    }

    private function isSensitiveRoute(string $routeName): bool
    {
        foreach ($this->sensitivePatterns as $pattern) {
            if (str_contains($routeName, $pattern)) {
                return true;
            }
        }

        return false;
    }

    private function extractSubject(Request $request): array
    {
        $params = $request->route()?->parameters() ?? [];
        $subject = [];

        foreach ($params as $key => $value) {
            // If it's an Eloquent model, get class and id
            if (is_object($value) && method_exists($value, 'getKey')) {
                $subject[$key] = [
                    'type' => class_basename($value),
                    'id'   => $value->getKey(),
                ];
            } else {
                $subject[$key] = $value;
            }
        }

        return $subject;
    }
}
