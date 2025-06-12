export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // Nuevas características (versión menor)
                'fix',      // Corrección de errores (parche)
                'docs',     // Solo documentación (no cambia versión)
                'style',    // Formateo, punto y coma, etc. (no cambia versión)
                'refactor', // Refactorización de código (no cambia versión)
                'perf',     // Mejoras de rendimiento (parche)
                'test',     // Pruebas (no cambia versión)
                'chore',    // Tareas de mantenimiento (no cambia versión)
                'breaking'  // Cambios incompatibles (versión mayor)
            ]
        ]
    }
};