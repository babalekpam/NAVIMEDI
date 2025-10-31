/**
 * Code Example Generator
 * 
 * Generates code examples in multiple languages (curl, JavaScript, Python)
 * for API endpoints in the NaviMED Healthcare Platform
 */

export interface EndpointParams {
  path?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  apiKey?: string;
  token?: string;
}

/**
 * Generate curl command example
 */
export function generateCurlExample(
  method: string,
  endpoint: string,
  params: EndpointParams = {}
): string {
  let url = endpoint;
  
  // Replace path parameters
  if (params.path) {
    Object.entries(params.path).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  // Add query parameters
  if (params.query) {
    const queryString = new URLSearchParams(params.query).toString();
    url += `?${queryString}`;
  }
  
  let curl = `curl -X ${method.toUpperCase()} '${url}'`;
  
  // Add authentication header
  if (params.apiKey) {
    curl += ` \\\n  -H 'X-API-Key: ${params.apiKey}'`;
  } else if (params.token) {
    curl += ` \\\n  -H 'Authorization: Bearer ${params.token}'`;
  } else {
    curl += ` \\\n  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`;
  }
  
  curl += ` \\\n  -H 'Content-Type: application/json'`;
  
  // Add request body
  if (params.body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    const bodyJson = JSON.stringify(params.body, null, 2);
    curl += ` \\\n  -d '${bodyJson}'`;
  }
  
  return curl;
}

/**
 * Generate JavaScript fetch example
 */
export function generateJavaScriptExample(
  method: string,
  endpoint: string,
  params: EndpointParams = {}
): string {
  let url = endpoint;
  
  // Replace path parameters
  if (params.path) {
    Object.entries(params.path).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  // Add query parameters
  if (params.query) {
    const queryString = new URLSearchParams(params.query).toString();
    url += `?${queryString}`;
  }
  
  const hasBody = params.body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
  
  const authHeader = params.apiKey 
    ? `'X-API-Key': '${params.apiKey}'`
    : params.token
    ? `'Authorization': 'Bearer ${params.token}'`
    : `'Authorization': 'Bearer YOUR_JWT_TOKEN'`;
  
  let code = `// Using fetch API
const response = await fetch('${url}', {
  method: '${method.toUpperCase()}',
  headers: {
    'Content-Type': 'application/json',
    ${authHeader}
  }`;
  
  if (hasBody) {
    code += `,\n  body: JSON.stringify(${JSON.stringify(params.body, null, 2)})`;
  }
  
  code += `\n});

if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}

const data = await response.json();
console.log(data);`;
  
  return code;
}

/**
 * Generate Python requests example
 */
export function generatePythonExample(
  method: string,
  endpoint: string,
  params: EndpointParams = {}
): string {
  let url = endpoint;
  
  // Replace path parameters
  if (params.path) {
    Object.entries(params.path).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  // Add query parameters
  if (params.query) {
    const queryString = new URLSearchParams(params.query).toString();
    url += `?${queryString}`;
  }
  
  const hasBody = params.body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
  
  const authHeader = params.apiKey 
    ? `'X-API-Key': '${params.apiKey}'`
    : params.token
    ? `'Authorization': 'Bearer ${params.token}'`
    : `'Authorization': 'Bearer YOUR_JWT_TOKEN'`;
  
  let code = `import requests

url = '${url}'
headers = {
    'Content-Type': 'application/json',
    ${authHeader}
}
`;
  
  if (hasBody) {
    code += `data = ${JSON.stringify(params.body, null, 2)}

response = requests.${method.toLowerCase()}(url, headers=headers, json=data)`;
  } else {
    code += `response = requests.${method.toLowerCase()}(url, headers=headers)`;
  }
  
  code += `
response.raise_for_status()
print(response.json())`;
  
  return code;
}

/**
 * Generate code examples for all supported languages
 */
export function generateAllExamples(
  method: string,
  endpoint: string,
  params: EndpointParams = {}
): {
  curl: string;
  javascript: string;
  python: string;
} {
  return {
    curl: generateCurlExample(method, endpoint, params),
    javascript: generateJavaScriptExample(method, endpoint, params),
    python: generatePythonExample(method, endpoint, params)
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
