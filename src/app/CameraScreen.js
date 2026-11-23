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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

let MapView = null;
let Marker = null;
let Circle = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

const campusLatitude = process.env.EXPO_PUBLIC_CAMPUS_LATITUDE?.trim();
const campusLongitude = process.env.EXPO_PUBLIC_CAMPUS_LONGITUDE?.trim();
const campusRadius = process.env.EXPO_PUBLIC_CAMPUS_RADIUS_METERS?.trim();

const parsedCampusLatitude = campusLatitude ? Number(campusLatitude) : NaN;
const parsedCampusLongitude = campusLongitude ? Number(campusLongitude) : NaN;
const parsedCampusRadius = campusRadius ? Number(campusRadius) : NaN;

const CAMPUS_GEOFENCE = {
  latitude: parsedCampusLatitude,
  longitude: parsedCampusLongitude,
  radiusMeters:
    Number.isFinite(parsedCampusRadius) && parsedCampusRadius > 0
      ? parsedCampusRadius
      : 500,
};

const hasCampusGeofence = () =>
  Number.isFinite(CAMPUS_GEOFENCE.latitude) &&
  Number.isFinite(CAMPUS_GEOFENCE.longitude) &&
  CAMPUS_GEOFENCE.latitude >= -90 &&
  CAMPUS_GEOFENCE.latitude <= 90 &&
  CAMPUS_GEOFENCE.longitude >= -180 &&
  CAMPUS_GEOFENCE.longitude <= 180;

const distanceInMeters = (latitudeA, longitudeA, latitudeB, longitudeB) => {
  const earthRadius = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDistance = toRadians(latitudeB - latitudeA);
  const longitudeDistance = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDistance / 2) *
      Math.sin(longitudeDistance / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function CameraScreen({
  createReport,
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
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isInsideCampus, setIsInsideCampus] = useState(null);
  const [locationAddressLoading, setLocationAddressLoading] = useState(false);
  const [showLocationPermissionNotice, setShowLocationPermissionNotice] =
    useState(false);
  const mapRef = useRef(null);
  const reverseGeocodeSequence = useRef(0);
  const previousInsideCampus = useRef(null);

  const refreshReverseAddress = useCallback(async (latitude, longitude) => {
    const sequence = ++reverseGeocodeSequence.current;
    setLocationAddressLoading(true);
    setLocationAddress('');

    try {
      let formatted = '';

      if (Platform.OS === 'web') {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
          { headers: { Accept: 'application/json' } }
        );
        if (!response.ok) {
          throw new Error(`Reverse geocoding gagal dengan status ${response.status}`);
        }
        const data = await response.json();
        formatted = data?.display_name || '';
      } else {
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addresses?.length) {
          const address = addresses[0];
          formatted = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.region,
            address.postalCode,
            address.country,
          ]
            .filter((part, index, parts) => part && parts.indexOf(part) === index)
            .join(', ');
        }
      }

      if (sequence === reverseGeocodeSequence.current) {
        setLocationAddress(
          formatted || 'Alamat tidak ditemukan untuk titik ini'
        );
      }
    } catch (error) {
      console.error('Reverse geocoding gagal:', error);
      if (sequence === reverseGeocodeSequence.current) {
        setLocationAddress('Alamat tidak dapat diperoleh. Periksa koneksi internet.');
      }
    } finally {
      if (sequence === reverseGeocodeSequence.current) {
        setLocationAddressLoading(false);
      }
    }
  }, []);

  const applyLocation = useCallback(
    (location, allowMapCenter = true) => {
      if (!location?.coords) return;
      const coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setSelectedLocation(coordinate);
      setLocationAccuracy(
        typeof location.coords.accuracy === 'number'
          ? location.coords.accuracy
          : null
      );

      if (hasCampusGeofence()) {
        const distance = distanceInMeters(
          coordinate.latitude,
          coordinate.longitude,
          CAMPUS_GEOFENCE.latitude,
          CAMPUS_GEOFENCE.longitude
        );
        const inside = distance <= CAMPUS_GEOFENCE.radiusMeters;
        setIsInsideCampus(inside);
        if (
          previousInsideCampus.current !== null &&
          previousInsideCampus.current !== inside
        ) {
          Alert.alert(
            'Status Area Kampus Berubah',
            inside
              ? 'Lokasi Anda sekarang berada di dalam area kampus.'
              : 'Lokasi Anda sekarang berada di luar area kampus.'
          );
        }
        previousInsideCampus.current = inside;
      } else {
        setIsInsideCampus(null);
      }

      refreshReverseAddress(coordinate.latitude, coordinate.longitude);
      if (allowMapCenter && mapRef.current) {
        mapRef.current.animateToRegion(
          { ...coordinate, latitudeDelta: 0.004, longitudeDelta: 0.004 },
          500
        );
      }
    },
    [refreshReverseAddress]
  );

  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError('');
    setShowLocationPermissionNotice(false);

    try {
      if (Platform.OS === 'web') {
        await Location.installWebGeolocationPolyfill();
      }

      let permission = locationPermission;
      if (!permission?.granted) {
        permission = await requestLocationPermission();
      }
      if (!permission?.granted) {
        setLocationError(
          permission?.canAskAgain
            ? 'Izin lokasi ditolak. Aktifkan izin untuk mengambil lokasi.'
            : 'Izin lokasi diblokir. Aktifkan izin KampusCare di pengaturan perangkat.'
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationError('Layanan lokasi perangkat tidak aktif. Aktifkan GPS terlebih dahulu.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      applyLocation(location);
    } catch (error) {
      console.error('Gagal mengambil lokasi:', error);
      setLocationError('Lokasi aktual tidak dapat diperoleh. Coba lagi atau periksa GPS.');
    } finally {
      setLocationLoading(false);
    }
  }, [applyLocation, locationPermission, requestLocationPermission]);

  const openLocationSettings = useCallback(async () => {
    if (Platform.OS === 'web') {
      setLocationError(
        'Izinkan lokasi melalui ikon pengaturan situs pada browser, lalu muat ulang halaman.'
      );
      return;
    }
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Gagal membuka pengaturan lokasi:', error);
      setLocationError('Pengaturan lokasi tidak dapat dibuka. Aktifkan izin secara manual.');
    }
  }, []);

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

  useEffect(() => {
    if (locationPermission && !locationPermission.granted) {
      setShowLocationPermissionNotice(true);
    } else if (locationPermission?.granted) {
      setShowLocationPermissionNotice(false);
    }
  }, [locationPermission]);

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

    if (!selectedLocation) {
      setErrorMessage('Ambil atau pilih lokasi kerusakan terlebih dahulu');
      return;
    }

    if (!damageDescription.trim()) {
      setErrorMessage('Deskripsi kerusakan wajib diisi');
      return;
    }

    setIsCapturing(true);
    setErrorMessage('');

    try {
      if (createReport) {
        // Submit langsung ke backend API menggunakan multipart/form-data
        await createReport({
          title: buildingLocation.trim()
            ? `Kerusakan di ${buildingLocation.trim()}`
            : 'Laporan Kerusakan Fasilitas Kampus',
          description: damageDescription.trim(),
          location: buildingLocation.trim() || locationAddress || 'Lokasi dari GPS',
          photoUri: photo.uri,
          latitude: selectedLocation?.latitude ?? null,
          longitude: selectedLocation?.longitude ?? null,
          locationAddress: locationAddress || null,
          locationAccuracy,
          isInsideCampus,
        });

        Alert.alert(
          'Laporan Terkirim! 📸',
          'Laporan kerusakan fasilitas beserta foto berhasil dikirim ke server KampusCare.'
        );
      } else if (handleCreateNewReport) {
        // Fallback backward compatibility
        await handleCreateNewReport(photo.uri, {
          location: buildingLocation,
          description: damageDescription,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
          locationAddress,
          locationAccuracy,
          isInsideCampus,
        });
      }

      setIsCameraReady(false);
      setPhoto(null);
      setShowDetails(false);
      setBuildingLocation('');
      setDamageDescription('');
      onReportSubmitted?.();
    } catch (error) {
      console.error('Gagal mengirim laporan ke API:', error);
      const errMsg = error.message || 'Gagal mengirim laporan ke server. Silakan coba lagi.';
      setErrorMessage(errMsg);
      Alert.alert(
        'Pengiriman Gagal',
        `${errMsg}\n\nDraft laporan dan foto Anda tetap tersimpan di form untuk dikirim ulang.`
      );
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
                onPress={() => {
                  setShowDetails(true);
                  if (!selectedLocation) {
                    getCurrentLocation();
                  }
                }}
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
        <Text style={styles.fieldLabel}>Lokasi Kerusakan</Text>
        {showLocationPermissionNotice && !locationPermission?.granted ? (
          <View style={styles.locationPermissionNotice}>
            <Text style={styles.locationPermissionTitle}>
              Akses lokasi diperlukan
            </Text>
            <Text style={styles.locationPermissionText}>
              KampusCare menggunakan lokasi Anda untuk menentukan titik kerusakan
              fasilitas kampus dan menampilkan peta pada laporan.
            </Text>
            <TouchableOpacity
              style={styles.locationPermissionButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {locationLoading ? 'Meminta Izin...' : 'Lanjutkan dan Izinkan Lokasi'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {locationPermission &&
        !locationPermission.granted &&
        locationPermission.canAskAgain === false ? (
          <TouchableOpacity
            style={styles.locationPermissionButton}
            onPress={openLocationSettings}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Buka Pengaturan Lokasi</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.locationButton, locationLoading && styles.disabledButton]}
          onPress={getCurrentLocation}
          disabled={locationLoading}
          activeOpacity={0.8}
        >
          {locationLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {selectedLocation ? 'Perbarui Lokasi GPS' : 'Ambil Lokasi GPS'}
            </Text>
          )}
        </TouchableOpacity>

        {selectedLocation && Platform.OS === 'web' ? (
          <View style={styles.mapContainer}>
            {React.createElement('iframe', {
              title: 'Peta lokasi kerusakan',
              src: `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
                `${selectedLocation.longitude - 0.006},${selectedLocation.latitude - 0.004},${selectedLocation.longitude + 0.006},${selectedLocation.latitude + 0.004}`
              )}&layer=mapnik&marker=${encodeURIComponent(
                `${selectedLocation.latitude},${selectedLocation.longitude}`
              )}`,
              style: {
                border: 0,
                width: '100%',
                height: '220px',
              },
              loading: 'lazy',
            })}
            <TouchableOpacity
              style={styles.centerMapButton}
              onPress={getCurrentLocation}
              activeOpacity={0.8}
            >
              <Text style={styles.centerMapText}>Pusatkan</Text>
            </TouchableOpacity>
          </View>
        ) : selectedLocation && Platform.OS !== 'web' && MapView ? (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                ...selectedLocation,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
              }}
              onPress={(event) => {
                const coordinate = event.nativeEvent.coordinate;
                applyLocation({ coords: coordinate });
              }}
            >
              <Marker
                coordinate={selectedLocation}
                draggable
                onDragEnd={(event) => applyLocation({ coords: event.nativeEvent.coordinate })}
              />
              {hasCampusGeofence() && (
                <Circle
                  center={{
                    latitude: CAMPUS_GEOFENCE.latitude,
                    longitude: CAMPUS_GEOFENCE.longitude,
                  }}
                  radius={CAMPUS_GEOFENCE.radiusMeters}
                  strokeWidth={2}
                  strokeColor="#4F46E5"
                  fillColor="rgba(79, 70, 229, 0.12)"
                />
              )}
            </MapView>
            <TouchableOpacity
              style={styles.centerMapButton}
              onPress={() => {
                if (mapRef.current && selectedLocation) {
                  mapRef.current.animateToRegion(
                    { ...selectedLocation, latitudeDelta: 0.004, longitudeDelta: 0.004 },
                    500
                  );
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.centerMapText}>Pusatkan</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {selectedLocation ? (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Latitude: {selectedLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Longitude: {selectedLocation.longitude.toFixed(6)}
            </Text>
            {locationAccuracy !== null ? (
              <Text style={styles.locationText}>
                Akurasi: ±{Math.round(locationAccuracy)} meter
              </Text>
            ) : null}
            <Text style={styles.locationAddress}>
              {locationAddressLoading
                ? 'Mencari alamat berdasarkan koordinat...'
                : locationAddress || 'Mencari alamat...'}
            </Text>
            {isInsideCampus !== null ? (
              <View
                style={[
                  styles.geofenceBadge,
                  isInsideCampus ? styles.insideBadge : styles.outsideBadge,
                ]}
              >
                <Text
                  style={[
                    styles.geofenceText,
                    isInsideCampus ? styles.insideText : styles.outsideText,
                  ]}
                >
                  {isInsideCampus ? 'Di dalam area kampus' : 'Di luar area kampus'}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationHint}>
                Area kampus belum dikonfigurasi. Set variabel EXPO_PUBLIC_CAMPUS_*.
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.locationHint}>
            Lokasi GPS belum dipilih.
          </Text>
        )}
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
        <Text style={styles.formHint}>
          Periksa dan lengkapi deskripsi secara manual sebelum menyimpan laporan.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (isCapturing || !damageDescription.trim() || !selectedLocation) && styles.disabledButton,
          ]}
          onPress={submitReport}
          disabled={isCapturing || !damageDescription.trim() || !selectedLocation}
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
  locationButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mapContainer: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerMapButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  centerMapText: {
    color: '#334155',
    fontWeight: '700',
  },
  locationInfo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  locationText: {
    color: '#334155',
    fontSize: 12,
    marginBottom: 3,
  },
  locationAddress: {
    color: '#0F172A',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  locationHint: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 10,
  },
  locationPermissionNotice: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  locationPermissionTitle: {
    color: '#3730A3',
    fontSize: 14,
    fontWeight: '800',
  },
  locationPermissionText: {
    color: '#4F46E5',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  locationPermissionButton: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  geofenceBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  insideBadge: {
    backgroundColor: '#DCFCE7',
  },
  outsideBadge: {
    backgroundColor: '#FEE2E2',
  },
  geofenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  insideText: {
    color: '#166534',
  },
  outsideText: {
    color: '#991B1B',
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
