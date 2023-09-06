import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button, PermissionsAndroid, Platform, Alert } from 'react-native';
import FilePickerComponent from './FilePickerComponent';
import { PERMISSIONS, request } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';
import getRandomValues from 'react-native-get-random-values';



const Shredding: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState('');

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
    const requestManageDocumentsPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.MANAGE_DOCUMENTS,
                {
                    title: 'Manage Documents Permission',
                    message: 'App needs access to manage documents for secure file deletion.',
                    buttonPositive: 'OK',
                }
                );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Manage documents permission granted');
            } else {
                console.warn('Manage documents permission denied');
            }
        } catch (error) {
          console.error('Error requesting manage documents permission:', error);
        }
      };

    const generateRandomData = (sizeInBytes: number) => {
        const words = CryptoJS.lib.WordArray.random(sizeInBytes);
        const base64Data = CryptoJS.enc.Base64.stringify(words);
        return base64Data;
    };

    const generateEntropy = () => {
        return new Date().getTime().toString();
    };
    
    // Function to securely delete a file by overwriting it with random data
    const secureDeleteFile = async () => {
        try {
            // const dataSizeInBytes = 1024 * 1024; // For example, 1 MB of random data
            // const randomData = generateRandomData(dataSizeInBytes);

            const entropy = generateEntropy();
            const dataSizeInBytes = 1024 * 1024; // For example, 1 MB of data
            const randomData = entropy.repeat(dataSizeInBytes / entropy.length);
            // console.info('Random Data: ', randomData)
            const filePath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/CamApp/_20230906T084221.jpg`;
            console.info('FilePath: ', filePath);
            const fileExists = await RNFS.exists(filePath);
            if(fileExists){
                // Perform multiple overwrites with random data
                await requestStoragePermission()
                await RNFS.write(filePath, randomData, 0, 'base64');
                await RNFS.write(filePath, randomData, 0, 'base64');
                await RNFS.write(filePath, randomData, 0, 'base64');
                
            
                // Finally, delete the file
                await RNFS.unlink(filePath);
                console.log('File securely deleted.');
            }
            else{
                Alert.alert('No such file or directory exists', 'Please select a  file');
            }
            
        } catch (error) {
            console.error('Error securely deleting file:', error);
        }
    };
    const secureDeleteFile1 = async () => {
        
        try {

            // requestManageDocumentsPermission();
             // Grant URI permission
            // const uriPermission = await PermissionsAndroid.checkPermission(PermissionsAndroid.PERMISSIONS.MANAGE_DOCUMENTS);

            // Generate random data to overwrite the file
            requestStoragePermission();
            const randomData = [...Array(1024)].map(() => Math.random().toString(36)[2]).join('');
            // console.warn("random Data: ", randomData)
            
            // Overwrite the file with random data
            const filePath = `${RNFS.ExternalStorageDirectoryPath}/DCIM/CamApp/_20230906T082850.jpg`;
            
            await RNFS.writeFile(filePath, randomData, 'utf8');
            await RNFS.writeFile(filePath, randomData, 'utf8');
            await RNFS.writeFile(filePath, randomData, 'utf8');
            await RNFS.writeFile(filePath, randomData, 'utf8');
            
            // Delete the file
            await RNFS.unlink(filePath);
        
            console.log(`File securely deleted: ${filePath}`);
            
        } catch (error) {
            console.error(`Error securely deleting file: ${error}`);
        }
        setSelectedFile('')
    };

    const handleFileSelected =  (uri: string) => {``
    console.warn('Selected URI: ', uri)
    try {
        const decodedFilePath = decodeURIComponent(uri.replace(/\%3A/g, '/').replace(/\%2F/g, '/')); 
        console.info('Decoded URI: ', decodedFilePath)
        setSelectedFile(decodedFilePath);
    } catch (error) {
        console.error('Error decoding path:', error);
    }
};

    return(
        <View style={styles.container}>
            <Text style={{marginBottom: 20, textTransform: 'uppercase'}}>Select File to delete permanantly</Text>
            <FilePickerComponent onFileSelected={handleFileSelected}/>
            {selectedFile !== '' && (
            <TextInput
              style={styles.pathInput}
              value={selectedFile}
              editable={true}
            />
          )}
          <View style={{margin: '10%', width: '80%'}}>
            <Button title='Delete' onPress={secureDeleteFile} />
          </View>
        </View>
    )
}

export default Shredding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: '20%'
        
    },
    pathInput: {
      margin: 10,
      borderWidth: 1,
      borderColor: 'gray',
      padding: 10,
      color: 'black'
    },
});