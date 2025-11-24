import React from 'react';
import { CheckCircle, Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Testimonial {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  authorRole?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loadingStates: any;
  onApproveTestimonial: (id: number) => Promise<void>;
  onDeleteTestimonial: (id: number) => Promise<void>;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  loadingStates,
  onApproveTestimonial,
  onDeleteTestimonial
}) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des témoignages</CardTitle>
          <CardDescription>
            Approuvez ou rejetez les témoignages soumis par les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{testimonial.authorName}</div>
                        {testimonial.authorRole && (
                          <div className="text-sm text-gray-500">{testimonial.authorRole}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({testimonial.rating}/5)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="line-clamp-2">{testimonial.comment}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={testimonial.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {testimonial.isApproved ? 'Approuvé' : 'En attente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(testimonial.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!testimonial.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => onApproveTestimonial(testimonial.id)}
                            disabled={loadingStates.approveTestimonial}
                            className="gap-1"
                          >
                            {loadingStates.approveTestimonial ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Approuver...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Approuver
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteTestimonial(testimonial.id)}
                          disabled={loadingStates.deleteTestimonial}
                        >
                          {loadingStates.deleteTestimonial ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                              Supprimer...
                            </>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {testimonials.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun témoignage pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};