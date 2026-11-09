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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({
  handleCreateNewReport,
  onCameraFullscreenChange,
  onExitCamera,
  onReportSubmitted,
}) {
  const insets = useSafeAreaInsets();
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
  const [showDetails, setShowDetails] = useState(false);
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
    onCameraFullscreenChange?.(!showDetails);
  }, [onCameraFullscreenChange, showDetails]);

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

  //camera
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
        setShowDetails(false);
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

  const submitReport = async () => {
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
        setShowDetails(false);
        setBuildingLocation('');
        setDamageDescription('');
        onReportSubmitted?.();
      }
    } catch (error) {
      console.error('Gagal menggunakan foto untuk laporan', error);
      setErrorMessage('Foto belum dapat ditambahkan ke laporan. Silakan coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  };

  const permissionDenied = currentPermission && !currentPermission.granted;

  if (!showDetails) {
    return (
      <View style={styles.cameraScreen}>
        {photo ? (
          <Image
            source={{ uri: photo.uri }}
            style={styles.fullscreenPreview}
            resizeMode="cover"
          />
        ) : permissionDenied ? (
          <View style={styles.cameraMessageContainer}>
            <Text style={styles.cameraMessageTitle}>Izin kamera diperlukan</Text>
            <Text style={styles.cameraMessageText}>
              Izinkan akses kamera untuk mengambil foto laporan kerusakan.
            </Text>
            <TouchableOpacity
              style={styles.cameraMessageButton}
              onPress={currentPermission.canAskAgain ? askForPermission : openSettings}
              disabled={isRequestingPermission}
              activeOpacity={0.8}
            >
              {isRequestingPermission ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {currentPermission.canAskAgain ? 'Minta Izin Kamera' : 'Buka Pengaturan'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : !currentPermission ? (
          <View style={styles.cameraMessageContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.cameraMessageText}>Memeriksa izin kamera...</Text>
          </View>
        ) : cameraUnavailable ? (
          <View style={styles.cameraMessageContainer}>
            <Text style={styles.cameraMessageTitle}>Kamera tidak tersedia</Text>
            <Text style={styles.cameraMessageText}>
              Pastikan kamera tidak sedang digunakan aplikasi lain.
            </Text>
            <TouchableOpacity
              style={styles.cameraMessageButton}
              onPress={retryCamera}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : !isAppActive ? (
          <View style={styles.cameraMessageContainer}>
            <Text style={styles.cameraMessageText}>
              Kamera dijeda saat aplikasi tidak aktif.
            </Text>
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.fullscreenPreview}
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

        <View style={[styles.cameraHeader, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.cameraBackButton}
            onPress={onExitCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.cameraBackText}>‹ Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>
            {photo ? 'Periksa Foto' : 'Laporan Kerusakan'}
          </Text>
          <Text style={styles.cameraSubtitle}>
            {photo
              ? 'Pastikan foto kerusakan terlihat jelas.'
              : 'Arahkan kamera ke fasilitas yang rusak.'}
          </Text>
        </View>

        <View
          style={[
            styles.cameraControls,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {photo ? (
            <>
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => {
                  setPhoto(null);
                  setIsCameraReady(false);
                  setErrorMessage('');
                }}
                disabled={isCapturing}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewSecondaryText}>Ambil Ulang</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reviewContinueButton}
                onPress={() => setShowDetails(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewContinueText}>Foto Cocok, Lanjutkan</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.galleryControl}
                onPress={choosePhoto}
                disabled={isCapturing}
                activeOpacity={0.8}
              >
                {isCapturing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.galleryControlText}>Galeri</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  (!isAppActive ||
                    !isCameraReady ||
                    isCapturing ||
                    permissionDenied ||
                    cameraUnavailable) &&
                    styles.captureButtonDisabled,
                ]}
                onPress={capturePhoto}
                disabled={
                  !isAppActive ||
                  !isCameraReady ||
                  isCapturing ||
                  permissionDenied ||
                  cameraUnavailable
                }
                accessibilityRole="button"
                accessibilityLabel="Ambil foto"
                activeOpacity={0.8}
              >
                {isCapturing ? <ActivityIndicator color="#0F172A" /> : null}
              </TouchableOpacity>
              <View style={styles.galleryControlPlaceholder} />
            </>
          )}
          {errorMessage ? <Text style={styles.cameraErrorText}>{errorMessage}</Text> : null}
          {galleryPermissionBlocked ? (
            <TouchableOpacity onPress={openSettings} activeOpacity={0.8}>
              <Text style={styles.cameraSettingsLink}>Buka Pengaturan</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Kerusakan</Text>
      </View>

      <Image
        source={{ uri: photo.uri }}
        style={styles.detailsPreview}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.changePhotoButton}
        onPress={() => setShowDetails(false)}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Ganti Foto</Text>
      </TouchableOpacity>

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
          style={[
            styles.primaryButton,
            (isCapturing || !damageDescription.trim()) && styles.disabledButton,
          ]}
          onPress={submitReport}
          disabled={isCapturing || !damageDescription.trim()}
          activeOpacity={0.8}
        >
          {isCapturing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Kirim Laporan</Text>
          )}
        </TouchableOpacity>
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
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenPreview: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  cameraBackButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingVertical: 6,
  },
  cameraBackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cameraSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  cameraControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 150,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  galleryControl: {
    width: 64,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryControlText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  galleryControlPlaceholder: {
    width: 64,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  reviewButton: {
    minHeight: 52,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  reviewSecondaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reviewContinueButton: {
    minHeight: 52,
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#4F46E5',
  },
  reviewContinueText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cameraMessageContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#0F172A',
  },
  cameraMessageTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  cameraMessageText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  cameraMessageButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  cameraErrorText: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  cameraSettingsLink: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
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
  detailsPreview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 18,
    backgroundColor: '#0F172A',
  },
  changePhotoButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
