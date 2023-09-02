import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import DocumentPicker, { pickDirectory } from 'react-native-document-picker';

interface DocumentPickerComponentProps {
  onDirectorySelected: (uri: string) => void;
}

const DocumentPickerComponent: React.FC<DocumentPickerComponentProps> = ({ onDirectorySelected }) => {
  const pickDocument = async () => {
    try {
      const selectedDirectory = await pickDirectory();
    console.info('Selected Directory: ', selectedDirectory)
      
      if (selectedDirectory) {
        const selectedDirectoryUri = selectedDirectory.uri;
        onDirectorySelected(selectedDirectoryUri);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
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
