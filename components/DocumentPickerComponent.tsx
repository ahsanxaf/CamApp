import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, ToastAndroid } from 'react-native';
import DocumentPicker, { DocumentPickerOptions, pickDirectory } from 'react-native-document-picker';

interface DocumentPickerComponentProps {
  onDirectorySelected: (uri: string) => void;
}

const allowedDirectories = ['DCIM', 'Pictures', 'Documents'];

const DocumentPickerComponent: React.FC<DocumentPickerComponentProps> = ({ onDirectorySelected }) => {
  const pickDocument = async () => {
    try {
      const options: DocumentPickerOptions<'ios' | 'android'> = {
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory', // You can specify other directories like 'downloadsDirectory', etc.
      };

      // Show the directory picker
      const selectedDirectory = await pickDirectory(options);

      if (selectedDirectory) {
        const selectedDirectoryUri = selectedDirectory.uri;

        // Check if the selected directory is allowed
        if (isSubdirectoryOfAllowedDirectory(selectedDirectoryUri)) {
          onDirectorySelected(selectedDirectoryUri);
        } else {
          // Handle the case where the selected directory is not allowed
          // console.warn('Selected directory is not allowed.');
          ToastAndroid.showWithGravity(
            'Selected Directory is not allowed',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
  };

  const isSubdirectoryOfAllowedDirectory = (directoryUri: string): boolean => {
    // Extract the directory name from the URI
    const decodedUri = decodeURIComponent(directoryUri.replace(/\%3A/g, '/').replace(/\%2F/g, '/'));
    const directoryName = decodedUri.split('/').pop();

    // Check if the directory name is in the allowedDirectories array
    if (allowedDirectories.includes(directoryName || '')) {
      return true; // The selected directory is one of the allowed root directories
    }

    // Check if the directory is a subdirectory of an allowed directory
    for (const rootDirectory in allowedDirectories) {
      if (directoryName || ''.startsWith(rootDirectory)) {
        return true;
      }
    }

    return false;
  };

  
  // 'content://com.android.externalstorage.documents/tree/primary%3ADCIM', 

  const isDirectoryAllowed = (directoryUri: string): boolean => {
    // Extract the directory name from the URI
    const decodedUri = decodeURIComponent(directoryUri.replace(/\%3A/g, '/').replace(/\%2F/g, '/'));
    const directoryName = decodedUri.split('/').pop();
    // console.info('directory name: ', directoryName)
    // Check if the directory name is in the allowedDirectories array
    return allowedDirectories.includes(directoryName || '');
  };

  return (
    <TouchableOpacity style={styles.selectDirectoryButton} onPress={pickDocument}>
      <Text style={styles.buttonText}>Choose Storage Path</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selectDirectoryButton: {
    backgroundColor: 'pink',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: 'black',
  },
});

export default DocumentPickerComponent;
