'use client';

import { useState } from 'react';
import { Star, ThumbsUp, User, ChevronDown, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Badge,
} from '@ecomify/ui';
import { cn } from '@ecomify/utils';

/**
 * Product Reviews Component
 * Display and submit product reviews with ratings
 */

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

// Mock reviews for demo
const mockReviews: Review[] = [
  {
    id: '1',
    author: 'John D.',
    rating: 5,
    title: 'Excellent quality!',
    content: 'This product exceeded my expectations. The quality is outstanding and it arrived quickly. Would definitely recommend to others.',
    date: '2024-11-15',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    author: 'Sarah M.',
    rating: 4,
    title: 'Good but could be better',
    content: 'Overall a good purchase. The product is nice but the packaging could be improved. Still, I\'m happy with my purchase.',
    date: '2024-11-10',
    helpful: 5,
    verified: true,
  },
  {
    id: '3',
    author: 'Mike R.',
    rating: 5,
    title: 'Perfect!',
    content: 'Exactly what I was looking for. Great value for money.',
    date: '2024-11-05',
    helpful: 8,
    verified: false,
  },
];

const ratingDistribution = [
  { stars: 5, count: 45, percentage: 65 },
  { stars: 4, count: 20, percentage: 29 },
  { stars: 3, count: 3, percentage: 4 },
  { stars: 2, count: 1, percentage: 1 },
  { stars: 1, count: 1, percentage: 1 },
];

export function ProductReviews({
  productId,
  reviews = mockReviews,
  averageRating = 4.5,
  totalReviews = 70,
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState<string>('all');

  const filteredReviews = reviews.filter((review) => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Average Rating */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                <StarRating rating={averageRating} size="lg" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {totalReviews} reviews
                </p>
              </div>
              <Separator orientation="vertical" className="h-24" />
              <div className="flex-1 space-y-1">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{item.stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Write Review CTA */}
        <Card>
          <CardContent className="flex h-full flex-col items-center justify-center pt-6 text-center">
            <h3 className="text-lg font-semibold">Share your thoughts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Help others by sharing your experience with this product
            </p>
            <Button className="mt-4" onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onSubmit={() => setShowReviewForm(false)}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <div className="flex gap-2">
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No reviews match your filter criteria.
            </CardContent>
          </Card>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Load More */}
      {sortedReviews.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Reviews
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Star Rating Component
 */
interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive
          ? star <= (hoverRating || rating)
          : star <= rating;
        const halfFilled = !interactive && star - 0.5 <= rating && star > rating;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={cn(
              'transition-colors',
              interactive && 'cursor-pointer hover:scale-110'
            )}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange?.(star)}
          >
            <Star
              className={cn(
                sizes[size],
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : halfFilled
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'fill-muted text-muted'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Review Card Component
 */
function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  const handleHelpful = () => {
    if (!voted) {
      setHelpful(helpful + 1);
      setVoted(true);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.author}</span>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>

        <h4 className="mt-4 font-semibold">{review.title}</h4>
        <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>

        <div className="mt-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            disabled={voted}
          >
            <ThumbsUp className={cn('mr-2 h-4 w-4', voted && 'fill-current')} />
            Helpful ({helpful})
          </Button>
          <Button variant="ghost" size="sm">
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Review Form Component
 */
interface ReviewFormProps {
  productId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

function ReviewForm({ productId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Your Rating *</Label>
            <div className="mt-2">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>
            {rating === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Click to rate
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reviewTitle">Review Title</Label>
            <Input
              id="reviewTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
            />
          </div>

          <div>
            <Label htmlFor="reviewContent">Your Review *</Label>
            <Textarea
              id="reviewContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you like or dislike? How did you use the product?"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
