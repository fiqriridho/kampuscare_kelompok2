import { File, Paths } from 'expo-file-system';

export default async function saveReportPhoto(photoUri) {
  const source = new File(photoUri);
  const fileName = `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${source.extension || '.jpg'}`;
  const destination = new File(Paths.document, fileName);

  await source.copy(destination);
  return destination.uri;
}
