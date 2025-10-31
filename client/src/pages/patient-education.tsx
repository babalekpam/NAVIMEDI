import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Search, Eye, Filter, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EducationContent {
  id: string;
  title: string;
  category: string;
  content: string;
  mediaUrl: string | null;
  difficultyLevel: string;
  viewCount: number;
  publishedAt: string;
}

export default function PatientEducation() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<EducationContent | null>(null);

  const { data: educationContent = [], isLoading } = useQuery<EducationContent[]>({
    queryKey: ['/api/patient-education', selectedCategory],
    enabled: true
  });

  const filteredContent = educationContent.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewArticle = async (article: EducationContent) => {
    setSelectedArticle(article);
    
    // Increment view count
    try {
      await apiRequest(`/api/patient-education/${article.id}/view`, {
        method: 'PATCH'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patient-education'] });
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      medication: 'bg-blue-500',
      condition: 'bg-purple-500',
      procedure: 'bg-green-500',
      wellness: 'bg-yellow-500',
      nutrition: 'bg-orange-500',
      exercise: 'bg-red-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getDifficultyColor = (level: string) => {
    const colors: { [key: string]: string } = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2" data-testid="heading-education">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Health Education Library
        </h1>
        <p className="text-gray-600">
          Learn about your health with trusted educational content
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                data-testid="input-search-education"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="condition">Condition</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="exercise">Exercise</SelectItem>
              </SelectContent>
            </Select>
            {selectedCategory && (
              <Button
                variant="outline"
                onClick={() => setSelectedCategory("")}
                data-testid="button-clear-filter"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education Content Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading education content...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
            <p className="text-gray-600">
              {searchQuery ? "Try adjusting your search query" : "No education content available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((article) => (
            <Card 
              key={article.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewArticle(article)}
              data-testid={`card-article-${article.id}`}
            >
              {article.mediaUrl && (
                <img 
                  src={article.mediaUrl} 
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  data-testid={`img-article-${article.id}`}
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                  <Badge className={getDifficultyColor(article.difficultyLevel)} variant="outline">
                    {article.difficultyLevel}
                  </Badge>
                </div>
                <CardTitle className="text-lg" data-testid={`text-title-${article.id}`}>
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {article.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span data-testid={`text-views-${article.id}`}>{article.viewCount} views</span>
                  </div>
                  <Button variant="link" className="p-0" data-testid={`button-read-${article.id}`}>
                    Read More →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Article Reader Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-article-reader">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge className={getCategoryColor(selectedArticle.category)}>
                        {selectedArticle.category}
                      </Badge>
                      <Badge className={getDifficultyColor(selectedArticle.difficultyLevel)} variant="outline">
                        {selectedArticle.difficultyLevel}
                      </Badge>
                    </div>
                    <DialogTitle className="text-2xl" data-testid="text-article-title">
                      {selectedArticle.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              {selectedArticle.mediaUrl && (
                <img 
                  src={selectedArticle.mediaUrl} 
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <div className="prose max-w-none" data-testid="text-article-content">
                <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
              </div>
              <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{selectedArticle.viewCount} views</span>
                </div>
                <span>
                  Published: {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
