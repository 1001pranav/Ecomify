/**
 * Product Form Screen
 * Create or edit product
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, Card, useAppTheme } from '@ecomify/ui';
import type { ProductsStackParamList } from '../../navigation/MainNavigator';

type ProductFormScreenProps = {
  navigation: NativeStackNavigationProp<ProductsStackParamList, 'ProductForm'>;
  route: RouteProp<ProductsStackParamList, 'ProductForm'>;
};

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  inventory: string;
  images: Array<{ uri: string }>;
}

export function ProductFormScreen({ navigation, route }: ProductFormScreenProps) {
  const theme = useAppTheme();
  const { productId } = route.params || {};
  const isEdit = !!productId;

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    inventory: '',
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...result.assets.map((a) => ({ uri: a.uri }))],
      }));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, { uri: result.assets[0].uri }],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', isEdit ? 'Product updated!' : 'Product created!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Images */}
        <Card>
          <Card.Header>
            <Card.Title>Images</Card.Title>
          </Card.Header>
          <Card.Content>
            <View style={styles.imagesGrid}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addImage, { borderColor: theme.colors.outline }]}
                onPress={pickImage}
              >
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 24 }}>+</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  Add Photo
                </Text>
              </TouchableOpacity>
            </View>
            <Button variant="outline" onPress={takePhoto} style={styles.cameraButton}>
              Take Photo
            </Button>
          </Card.Content>
        </Card>

        {/* Basic Info */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Basic Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <Input
              label="Title"
              value={formData.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="Product name"
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Product description"
              multiline
              numberOfLines={4}
            />
          </Card.Content>
        </Card>

        {/* Pricing */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Pricing</Card.Title>
          </Card.Header>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Price"
                  value={formData.price}
                  onChangeText={(v) => updateField('price', v)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  required
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Compare at Price"
                  value={formData.compareAtPrice}
                  onChangeText={(v) => updateField('compareAtPrice', v)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Inventory */}
        <Card style={styles.section}>
          <Card.Header>
            <Card.Title>Inventory</Card.Title>
          </Card.Header>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="SKU"
                  value={formData.sku}
                  onChangeText={(v) => updateField('sku', v)}
                  placeholder="SKU-001"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Quantity"
                  value={formData.inventory}
                  onChangeText={(v) => updateField('inventory', v)}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.actions}>
          <Button onPress={handleSave} loading={isLoading} fullWidth>
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            fullWidth
          >
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginTop: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    marginTop: 12,
  },
});
