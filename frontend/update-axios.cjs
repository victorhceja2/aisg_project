const fs = require('fs');
const path = require('path');

// Ruta base de tu proyecto
const basePath = path.join(__dirname, 'src');

// Función para buscar archivos de forma recursiva
function findFiles(dir, ext) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Llamada recursiva para directorios
            results = results.concat(findFiles(filePath, ext));
        } else {
            // Verificar la extensión
            if (path.extname(file) === ext || path.extname(file) === ext.replace('x', '')) {
                results.push(filePath);
            }
        }
    });

    return results;
}

// Encontrar todos los archivos TypeScript/JavaScript React
const files = findFiles(basePath, '.tsx');
files.push(...findFiles(basePath, '.jsx'));
files.push(...findFiles(basePath, '.ts'));
files.push(...findFiles(basePath, '.js'));

// Excluir axiosInstance.ts
const filteredFiles = files.filter(file => !file.includes('axiosInstance.ts'));

// Contar archivos modificados
let modifiedCount = 0;

// Procesar cada archivo
filteredFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Verificar si el archivo importa axios directamente
    if (content.includes("import axios from 'axios'") || content.includes('import axios from "axios"')) {
        // Añadir importación de axiosInstance si no existe
        if (!content.includes("import axiosInstance from") && !content.includes('import { axiosInstance }')) {
            const importPath = path.relative(path.dirname(file), path.join(basePath, 'api')).replace(/\\/g, '/');
            const importStatement = `import axiosInstance from '${importPath.startsWith('.') ? importPath : './' + importPath}/axiosInstance';\n`;

            // Reemplazar la importación de axios
            content = content.replace(/import axios from ['"]axios['"];?/, importStatement);
            modified = true;
        }

        // Reemplazar todas las instancias de axios.get, axios.post, etc.
        const axiosMethods = ['get', 'post', 'put', 'delete', 'patch'];

        axiosMethods.forEach(method => {
            // Buscar patrones como: axios.get(`${apiURL}/path`) o axios.get(apiURL + '/path')
            const regex1 = new RegExp(`axios\\.${method}\\(\\s*\\\`\\$\\{apiURL\\}(\\/[^\\\`]+)`, 'g');
            const regex2 = new RegExp(`axios\\.${method}\\(\\s*apiURL\\s*\\+\\s*['"]([^'"]+)['"]`, 'g');
            const regex3 = new RegExp(`axios\\.${method}\\(\\s*\\$\\{apiURL\\}([^\\)]+)`, 'g');
            const regex4 = new RegExp(`axios\\.${method}\\(\\s*["']http[^'"]+['"]`, 'g');

            if (content.match(regex1) || content.match(regex2) || content.match(regex3) || content.match(regex4)) {
                content = content.replace(regex1, `axiosInstance.${method}(\`$1`);
                content = content.replace(regex2, `axiosInstance.${method}(\`$1`);
                content = content.replace(regex3, `axiosInstance.${method}($1`);
                content = content.replace(regex4, match => {
                    // Extraer la URL y el path
                    const urlMatch = /["'](http[s]?:\/\/[^\/]+(\/[^'"]+))["']/.exec(match);
                    if (urlMatch && urlMatch[2]) {
                        return `axiosInstance.${method}(\`${urlMatch[2]}\``;
                    }
                    return match; // No se pudo extraer, dejarlo sin cambios
                });
                modified = true;
            }
        });

        // Eliminar las definiciones de apiURL que ya no son necesarias
        const apiUrlRegex = /const\s+apiURL\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|\s*["']http[^'"]+["'];?/;
        if (content.match(apiUrlRegex)) {
            content = content.replace(apiUrlRegex, '// apiURL ya no es necesario, usando axiosInstance');
            modified = true;
        }

        // Guardar el archivo si fue modificado
        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Actualizado: ${file}`);
            modifiedCount++;
        }
    }
});

console.log(`\nTotal de archivos modificados: ${modifiedCount} de ${filteredFiles.length}`);