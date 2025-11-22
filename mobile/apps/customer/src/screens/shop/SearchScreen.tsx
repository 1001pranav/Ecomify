/**
 * Search Screen
 * Product search with autocomplete
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme, Skeleton, EmptyState } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/core';
import { useDebounce } from '@ecomify/hooks';
import type { Product } from '@ecomify/types';
import type { RootStackParamList } from '../../navigation/RootNavigator';

// Mock search results
const mockResults: Product[] = [
  { id: '1', title: 'Classic T-Shirt', handle: 'classic-tshirt', images: [{ url: 'https://via.placeholder.com/100' }], variants: [{ price: 29.99 }] } as Product,
  { id: '2', title: 'Denim Jeans', handle: 'denim-jeans', images: [{ url: 'https://via.placeholder.com/100' }], variants: [{ price: 65.00 }] } as Product,
];

export function SearchScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      // Simulate API call
      setTimeout(() => {
        setResults(mockResults.filter(p =>
          p.title.toLowerCase().includes(debouncedQuery.toLowerCase())
        ));
        setIsSearching(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderResult = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.colors.outlineVariant }]}
      onPress={() => handleProductPress(item.id)}
    >
      <View style={[styles.resultImage, { backgroundColor: theme.colors.surfaceVariant }]}>
        {item.images[0]?.url && (
          <Image source={{ uri: item.images[0].url }} style={styles.image} />
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: theme.colors.onSurface }]}>
          {item.title}
        </Text>
        <Text style={[styles.resultPrice, { color: theme.colors.onSurfaceVariant }]}>
          {formatCurrency(item.variants[0]?.price || 0)}
        </Text>
      </View>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.onSurface }]}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={{ color: theme.colors.primary }}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isSearching ? (
        <View style={styles.loading}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={70} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.results}
        />
      ) : query.length >= 2 ? (
        <EmptyState
          title="No results found"
          description={`We couldn't find any products matching "${query}"`}
        />
      ) : (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionsTitle, { color: theme.colors.onSurfaceVariant }]}>
            Popular Searches
          </Text>
          {['T-Shirts', 'Jeans', 'Sneakers', 'Dresses'].map((term) => (
            <TouchableOpacity
              key={term}
              style={styles.suggestionItem}
              onPress={() => setQuery(term)}
            >
              <Text style={{ color: theme.colors.onSurface }}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  loading: {
    padding: 16,
  },
  results: {
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultPrice: {
    fontSize: 12,
    marginTop: 2,
  },
  suggestions: {
    padding: 16,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  suggestionItem: {
    paddingVertical: 12,
  },
});
