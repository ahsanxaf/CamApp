import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button, Alert, Animated, ToastAndroid } from 'react-native';
import FilePickerComponent from './FilePickerComponent';
import { PERMISSIONS, request } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import PercentageCircle from 'react-native-percentage-circle';

const Shredding: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('');
  const [numberOfPasses, setNumberOfPasses] = useState(3); // Default to 3 passes
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState(0);

  


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

  const secureDeleteFile = async () => {
    try {
      const entropy = generateEntropy();
      const dataSizeInBytes = 1024 * 1024; 
      const randomData = entropy.repeat(dataSizeInBytes / entropy.length);
    //   console.log('random data: ', randomData)
      const filePath = `${RNFS.ExternalStorageDirectoryPath}/${selectedFile}`;
      const fileExists = await RNFS.exists(filePath);

      if (fileExists) {
        await requestStoragePermission();
        setDeletionInProgress(true);
        setDeletionProgress(0);

        for (let pass = 0; pass < numberOfPasses; pass++) {
          await RNFS.write(filePath, randomData, 0, 'base64');

          // Update the progress
          const progressPercentage = Math.floor(((pass + 1) / numberOfPasses) * 100);
          setDeletionProgress(progressPercentage);
        }

        await RNFS.unlink(filePath);
        setDeletionInProgress(false);
        ToastAndroid.showWithGravity(
          `File securely deleted with ${numberOfPasses} passes.`,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        console.log(`File securely deleted with ${numberOfPasses} passes.`);
      } else {
        Alert.alert('No such file or directory exists', 'Please select a file');
      }
    } catch (error) {
      // setDeletionInProgress(false);
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
      const segments = decodedFilePath.split('/'); 
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
        <Button title="Delete" onPress={secureDeleteFile} disabled={!selectedFile} />
      </View>
      {deletionInProgress && (
        <View>
          <PercentageCircle radius={35} percent={deletionProgress} color='green' borderWidth={10}></PercentageCircle>  
        </View>
      )}
      
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
  bar: {
    height: 20,
    backgroundColor: 'green',
    borderRadius: 10,
  },
});
