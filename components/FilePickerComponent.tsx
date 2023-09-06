import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';


interface FilePickerComponentProps {
  onFileSelected: (uri: string) => void;
}
const FilePickerComponent: React.FC <FilePickerComponentProps> = ({onFileSelected}) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      // console.warn('result: ', result)
      if (result) {
        const selectedFileUri = result[0].uri;
        onFileSelected(selectedFileUri);
      }
    //   console.log(
    //     result.uri,
    //     result.type, // mime type
    //     result.name,
    //     result.size
    //   );
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
  };

  return (
    <View>
      <TouchableOpacity style={{
        backgroundColor: 'pink', 
        alignItems: 'center',
        padding: 10,
        borderRadius: 10
      }} 
      onPress={pickDocument}>
        <Text style={{color: 'black'}}>Choose file</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FilePickerComponent;
