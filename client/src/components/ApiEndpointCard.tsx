import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { generateAllExamples, copyToClipboard, type EndpointParams } from '@/lib/code-generator';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpointCardProps {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  requiresAuth?: boolean;
  permissions?: string[];
  parameters?: Array<{
    name: string;
    in: string;
    description: string;
    required: boolean;
    type?: string;
  }>;
  requestBodyExample?: any;
  responseExample?: any;
  rateLimit?: string;
}

export function ApiEndpointCard({
  path,
  method,
  summary,
  description,
  tags,
  requiresAuth = true,
  permissions = [],
  parameters = [],
  requestBodyExample,
  responseExample,
  rateLimit
}: ApiEndpointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500 dark:bg-blue-600',
    POST: 'bg-green-500 dark:bg-green-600',
    PUT: 'bg-yellow-500 dark:bg-yellow-600',
    PATCH: 'bg-orange-500 dark:bg-orange-600',
    DELETE: 'bg-red-500 dark:bg-red-600'
  };

  const params: EndpointParams = {
    body: requestBodyExample,
    path: parameters
      .filter(p => p.in === 'path')
      .reduce((acc, p) => ({ ...acc, [p.name]: `{${p.name}}` }), {}),
    query: parameters
      .filter(p => p.in === 'query')
      .reduce((acc, p) => ({ ...acc, [p.name]: 'value' }), {})
  };

  const codeExamples = generateAllExamples(method, path, params);

  const handleCopy = async (code: string, language: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(language);
      toast({
        title: 'Copied!',
        description: `${language} code copied to clipboard`
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="mb-4" data-testid={`endpoint-card-${method}-${path}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${methodColors[method]} text-white`} data-testid={`badge-method-${method}`}>
                {method}
              </Badge>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid="text-endpoint-path">
                {path}
              </code>
            </div>
            <CardTitle className="text-xl" data-testid="text-endpoint-summary">{summary}</CardTitle>
            <CardDescription data-testid="text-endpoint-description">{description}</CardDescription>
          </div>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="button-toggle-expand">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" data-testid={`badge-tag-${tag}`}>
              {tag}
            </Badge>
          ))}
          {requiresAuth && (
            <Badge variant="secondary" data-testid="badge-requires-auth">
              🔒 Authentication Required
            </Badge>
          )}
          {rateLimit && (
            <Badge variant="secondary" data-testid="badge-rate-limit">
              ⏱️ {rateLimit}
            </Badge>
          )}
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Permissions */}
            {permissions.length > 0 && (
              <div data-testid="section-permissions">
                <h4 className="font-semibold mb-2">Required Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {permissions.map(perm => (
                    <Badge key={perm} variant="outline" data-testid={`badge-permission-${perm}`}>
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Parameters */}
            {parameters.length > 0 && (
              <div data-testid="section-parameters">
                <h4 className="font-semibold mb-2">Parameters</h4>
                <div className="space-y-2">
                  {parameters.map((param, idx) => (
                    <div key={idx} className="border rounded p-3 bg-muted/50" data-testid={`parameter-${param.name}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono">{param.name}</code>
                        <Badge variant="outline" className="text-xs">{param.in}</Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{param.description}</p>
                      {param.type && (
                        <p className="text-xs text-muted-foreground mt-1">Type: {param.type}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request/Response Examples */}
            {(requestBodyExample || responseExample) && (
              <div data-testid="section-examples">
                <h4 className="font-semibold mb-2">Examples</h4>
                <Tabs defaultValue="request" className="w-full">
                  <TabsList>
                    {requestBodyExample && (
                      <TabsTrigger value="request" data-testid="tab-request">Request Body</TabsTrigger>
                    )}
                    {responseExample && (
                      <TabsTrigger value="response" data-testid="tab-response">Response</TabsTrigger>
                    )}
                  </TabsList>
                  
                  {requestBodyExample && (
                    <TabsContent value="request">
                      <div className="relative">
                        <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto" data-testid="code-request-body">
                          <code>{JSON.stringify(requestBodyExample, null, 2)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(JSON.stringify(requestBodyExample, null, 2), 'Request')}
                          data-testid="button-copy-request"
                        >
                          {copiedCode === 'Request' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                  )}
                  
                  {responseExample && (
                    <TabsContent value="response">
                      <div className="relative">
                        <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto" data-testid="code-response-body">
                          <code>{JSON.stringify(responseExample, null, 2)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(JSON.stringify(responseExample, null, 2), 'Response')}
                          data-testid="button-copy-response"
                        >
                          {copiedCode === 'Response' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}

            {/* Code Examples */}
            <div data-testid="section-code-examples">
              <h4 className="font-semibold mb-2">Code Examples</h4>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl" data-testid="tab-curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript" data-testid="tab-javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python" data-testid="tab-python">Python</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curl">
                  <div className="relative">
                    <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto" data-testid="code-curl">
                      <code>{codeExamples.curl}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:text-white"
                      onClick={() => handleCopy(codeExamples.curl, 'cURL')}
                      data-testid="button-copy-curl"
                    >
                      {copiedCode === 'cURL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="javascript">
                  <div className="relative">
                    <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto" data-testid="code-javascript">
                      <code>{codeExamples.javascript}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:text-white"
                      onClick={() => handleCopy(codeExamples.javascript, 'JavaScript')}
                      data-testid="button-copy-javascript"
                    >
                      {copiedCode === 'JavaScript' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="python">
                  <div className="relative">
                    <pre className="bg-black dark:bg-gray-900 text-white p-4 rounded overflow-x-auto" data-testid="code-python">
                      <code>{codeExamples.python}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:text-white"
                      onClick={() => handleCopy(codeExamples.python, 'Python')}
                      data-testid="button-copy-python"
                    >
                      {copiedCode === 'Python' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
