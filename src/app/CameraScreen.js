import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({ handleCreateNewReport }) {
  const cameraRef = useRef(null);
  const permissionRequestStarted = useRef(false);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [refreshedPermission, setRefreshedPermission] = useState(null);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState !== 'background' && AppState.currentState !== 'inactive'
  );
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [buildingLocation, setBuildingLocation] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [galleryPermissionBlocked, setGalleryPermissionBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const askForPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    setErrorMessage('');
    setRefreshedPermission(null);

    try {
      await requestPermission();
    } catch (error) {
      console.error('Gagal meminta izin kamera', error);
      setErrorMessage('Izin kamera tidak dapat diminta. Silakan coba lagi.');
    } finally {
      setIsRequestingPermission(false);
    }
  }, [requestPermission]);

  const currentPermission = refreshedPermission || permission;

  useEffect(() => {
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      const resumed = nextState === 'active' && previousState !== 'active';
      previousState = nextState;
      setIsAppActive(nextState === 'active');

      if (nextState !== 'active') {
        setIsCameraReady(false);
      } else if (resumed) {
        getPermission()
          .then(setRefreshedPermission)
          .catch((error) => {
            console.error('Gagal memeriksa ulang izin kamera', error);
            setErrorMessage('Status izin kamera tidak dapat diperiksa. Coba buka ulang tab kamera.');
          });
      }
    });

    return () => subscription.remove();
  }, [getPermission]);

  useEffect(() => {
    if (
      currentPermission &&
      !currentPermission.granted &&
      currentPermission.canAskAgain &&
      !permissionRequestStarted.current
    ) {
      permissionRequestStarted.current = true;
      askForPermission();
    }
  }, [askForPermission, currentPermission]);

  const capturePhoto = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return;
    }

    setIsCapturing(true);
    setErrorMessage('');
    setGalleryPermissionBlocked(false);

    try {
      const capturedPhoto = await cameraRef.current.takePictureAsync({
        quality: 0.75,
      });

      if (!capturedPhoto?.uri) {
        throw new Error('Kamera tidak menghasilkan file foto.');
      }

      setPhoto(capturedPhoto);
    } catch (error) {
      console.error('Gagal mengambil foto', error);
      setErrorMessage('Foto gagal diambil. Pastikan kamera siap, lalu coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  };

  const retryCamera = () => {
    setCameraUnavailable(false);
    setIsCameraReady(false);
    setErrorMessage('');
  };

  const choosePhoto = async () => {
    if (isCapturing) {
      return;
    }

    setIsCapturing(true);
    setErrorMessage('');
    setGalleryPermissionBlocked(false);

    try {
      let permissionResult = mediaPermission;
      if (!permissionResult?.granted) {
        if (permissionResult && !permissionResult.canAskAgain) {
          setGalleryPermissionBlocked(true);
          setErrorMessage(
            'Izin galeri diblokir. Aktifkan akses foto untuk KampusCare di pengaturan perangkat.'
          );
          return;
        }

        permissionResult = await requestMediaPermission();
      }

      if (!permissionResult.granted) {
        setGalleryPermissionBlocked(!permissionResult.canAskAgain);
        setErrorMessage(
          permissionResult.canAskAgain
            ? 'Izin galeri ditolak. Izinkan akses foto untuk memilih gambar.'
            : 'Izin galeri diblokir. Aktifkan akses foto untuk KampusCare di pengaturan perangkat.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.75,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPhoto({ uri: result.assets[0].uri });
        setIsCameraReady(false);
      }
    } catch (error) {
      console.error('Gagal memilih foto dari galeri', error);
      setErrorMessage('Galeri tidak dapat dibuka. Silakan coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  };

  const openSettings = async () => {
    if (Platform.OS === 'web') {
      setErrorMessage('Buka pengaturan izin kamera pada browser, lalu coba lagi.');
      return;
    }

    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Gagal membuka pengaturan izin kamera', error);
      setErrorMessage('Pengaturan perangkat tidak dapat dibuka. Silakan buka pengaturan aplikasi secara manual.');
    }
  };

  const usePhoto = async () => {
    if (!photo || isCapturing) {
      return;
    }

    setIsCapturing(true);
    setErrorMessage('');

    try {
      const reportCreated = await handleCreateNewReport(photo.uri, {
        location: buildingLocation,
        description: damageDescription,
      });
      if (reportCreated) {
        setIsCameraReady(false);
        setPhoto(null);
        setBuildingLocation('');
        setDamageDescription('');
      }
    } catch (error) {
      console.error('Gagal menggunakan foto untuk laporan', error);
      setErrorMessage('Foto belum dapat ditambahkan ke laporan. Silakan coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  };

  const permissionDenied = currentPermission && !currentPermission.granted;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Kerusakan</Text>
        <Text style={styles.subtitle}>
          Arahkan kamera ke fasilitas yang rusak untuk melampirkan foto pada laporan.
        </Text>
      </View>

      <View style={styles.previewFrame}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="contain" />
        ) : permissionDenied ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageIcon}>📷</Text>
            <Text style={styles.messageTitle}>Izin kamera diperlukan</Text>
            <Text style={styles.messageText}>
              Izinkan akses kamera agar Anda dapat melihat preview dan mengambil foto.
            </Text>
            {currentPermission.canAskAgain ? (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={askForPermission}
                disabled={isRequestingPermission}
                activeOpacity={0.8}
              >
                {isRequestingPermission ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.messageButtonText}>Minta Izin Kamera</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={openSettings}
                activeOpacity={0.8}
              >
                <Text style={styles.messageButtonText}>Buka Pengaturan</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : !currentPermission ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.messageText}>Memeriksa izin kamera...</Text>
          </View>
        ) : cameraUnavailable ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageIcon}>⚠️</Text>
            <Text style={styles.messageTitle}>Kamera tidak tersedia</Text>
            <Text style={styles.messageText}>
              Kamera tidak dapat dibuka. Pastikan kamera tidak sedang digunakan aplikasi lain.
            </Text>
            <TouchableOpacity style={styles.messageButton} onPress={retryCamera} activeOpacity={0.8}>
              <Text style={styles.messageButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : !isAppActive ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Kamera dijeda saat aplikasi tidak aktif.</Text>
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.preview}
              facing="back"
              onCameraReady={() => setIsCameraReady(true)}
              onMountError={(event) => {
                console.error('Preview kamera gagal dibuka', event.message);
                setIsCameraReady(false);
                setCameraUnavailable(true);
              }}
            />
            {!isCameraReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Menyiapkan kamera...</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.fieldLabel}>Gedung / lokasi</Text>
        <TextInput
          style={styles.textInput}
          value={buildingLocation}
          onChangeText={setBuildingLocation}
          placeholder="Contoh: Gedung Kuliah A, lantai 2"
          placeholderTextColor="#94A3B8"
          accessibilityLabel="Gedung atau lokasi kerusakan"
          returnKeyType="next"
        />
        <Text style={styles.fieldLabel}>Deskripsi kerusakan</Text>
        <TextInput
          style={[styles.textInput, styles.descriptionInput]}
          value={damageDescription}
          onChangeText={setDamageDescription}
          placeholder="Jelaskan fasilitas dan bagian yang rusak"
          placeholderTextColor="#94A3B8"
          accessibilityLabel="Deskripsi kerusakan"
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
        <Text style={styles.formHint}>
          Periksa dan lengkapi deskripsi secara manual sebelum menyimpan laporan.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.secondaryButton, styles.galleryButton]}
          onPress={choosePhoto}
          disabled={isCapturing}
          activeOpacity={0.8}
        >
          {isCapturing && !photo ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <Text style={styles.secondaryButtonText}>Pilih Foto dari Galeri</Text>
          )}
        </TouchableOpacity>
        {photo ? (
          <>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (isCapturing || !damageDescription.trim()) && styles.disabledButton,
              ]}
              onPress={usePhoto}
              disabled={isCapturing || !damageDescription.trim()}
              activeOpacity={0.8}
            >
              {isCapturing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Gunakan Foto</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setPhoto(null);
                setIsCameraReady(false);
                setErrorMessage('');
              }}
              disabled={isCapturing}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Ambil Ulang</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isAppActive ||
                !isCameraReady ||
                isCapturing ||
                permissionDenied ||
                cameraUnavailable) &&
                styles.disabledButton,
            ]}
            onPress={capturePhoto}
            disabled={
              !isAppActive ||
              !isCameraReady ||
              isCapturing ||
              permissionDenied ||
              cameraUnavailable
            }
            activeOpacity={0.8}
          >
            {isCapturing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Ambil Foto</Text>
            )}
          </TouchableOpacity>
        )}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {galleryPermissionBlocked ? (
          <TouchableOpacity onPress={openSettings} activeOpacity={0.8}>
            <Text style={styles.settingsLink}>Buka Pengaturan</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.note}>
          Foto dan deskripsi disimpan pada riwayat laporan lokal.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 92,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
  },
  previewFrame: {
    height: 300,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#0F172A',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 10,
  },
  messageContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  messageIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  messageButton: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actions: {
    alignItems: 'center',
    marginTop: 16,
  },
  form: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },
  textInput: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  descriptionInput: {
    minHeight: 100,
  },
  formHint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: -7,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.55,
  },
  secondaryButton: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  galleryButton: {
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  settingsLink: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  note: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
  },
});
