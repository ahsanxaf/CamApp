import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import FilePickerComponent from './FilePickerComponent';
import { PERMISSIONS, request } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';

const Shredding: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('');
  const [numberOfPasses, setNumberOfPasses] = useState(3); // Default to 3 passes

  const requestStoragePermission = async () => {
    try {
      const write = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      const read = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

      if (read === 'granted' && write === 'granted') {
        console.log('Storage permission granted');
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
    }
  };

  const generateRandomData = (sizeInBytes: number) => {
    const words = CryptoJS.lib.WordArray.random(sizeInBytes);
    const base64Data = CryptoJS.enc.Base64.stringify(words);
    return base64Data;
  };

  const secureDeleteFile = async () => {
    try {
      const entropy = generateEntropy();
      const dataSizeInBytes = 1024 * 1024; // For example, 1 MB of data
      const randomData = entropy.repeat(dataSizeInBytes / entropy.length);
    //   console.log('random data: ', randomData)
      const filePath = `${RNFS.ExternalStorageDirectoryPath}/${selectedFile}`;
      const fileExists = await RNFS.exists(filePath);

      if (fileExists) {
        await requestStoragePermission();

        // Perform multiple overwrites with the specified number of passes
        for (let pass = 0; pass < numberOfPasses; pass++) {
          await RNFS.write(filePath, randomData, 0, 'base64');
        }

        // Finally, delete the file
        await RNFS.unlink(filePath);
        console.log(`File securely deleted with ${numberOfPasses} passes.`);
      } else {
        Alert.alert('No such file or directory exists', 'Please select a file');
      }
    } catch (error) {
      console.error('Error securely deleting file:', error);
    }
  };

  const generateEntropy = () => {
    return new Date().getTime().toString();
  };

  const handleFileSelected = (uri: string) => {
    try {
      const decodedFilePath = decodeURIComponent(
        uri.replace(/\%3A/g, '/').replace(/\%2F/g, '/')
      );
      let selectedFileName = '';
      const segments = decodedFilePath.split('/'); // Split the URI by '/'
      const indexOfPrimary = segments.indexOf('primary');
      if (indexOfPrimary !== -1 && indexOfPrimary + 1 < segments.length) {
            selectedFileName = segments.slice(indexOfPrimary + 1).join('/');
      } else {
        console.log('Invalid URI'); 
      }
      console.info('Selected File Name: ', selectedFileName);
      setSelectedFile(selectedFileName);
    } catch (error) {
      console.error('Error decoding path:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 20, textTransform: 'uppercase' }}>
        Select File to delete permanently
      </Text>
      <FilePickerComponent onFileSelected={handleFileSelected} />
      {selectedFile !== '' && (
        <TextInput
          style={styles.pathInput}
          value={selectedFile}
          editable={true}
        />
      )}
      <TextInput
        style={styles.passInput}
        placeholder="Number of Passes (default: 3)"
        keyboardType="numeric"
        onChangeText={(text) => {
          // Ensure that the input is a valid number greater than or equal to 1
          const passes = parseInt(text, 10);
          if (!isNaN(passes) && passes >= 1) {
            setNumberOfPasses(passes);
          }
        }}
      />
      <View style={{ margin: '10%', width: '80%' }}>
        <Button title="Delete" onPress={secureDeleteFile} />
      </View>
    </View>
  );
};

export default Shredding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: '20%',
  },
  pathInput: {
    margin: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    color: 'black',
  },
  passInput: {
    margin: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    color: 'black',
  },
});
