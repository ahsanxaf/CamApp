import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const FilePickerComponent = () => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
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
      <TouchableOpacity style={{backgroundColor: 'pink', alignItems: 'center'}} onPress={pickDocument}>
        <Text style={{color: 'black'}}>Choose Storage Path</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FilePickerComponent;
