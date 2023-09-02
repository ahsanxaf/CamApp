import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import FilePickerComponent from './FilePickerComponent';
import DirectoryPickerComponent from './DocumentPickerComponent';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import DocumentPickerComponent from './DocumentPickerComponent';
import { PERMISSIONS, request } from 'react-native-permissions';

interface StorageModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePath: (path: string) => void; // Callback function to send the selected path back
}



const StorageModal: React.FC<StorageModalProps> = ({ visible, onClose, onSavePath }) => {

  const [selectedPath, setSelectedPath] = useState('');

  const handleDirectorySelected =  (uri: string) => {
    console.warn('Selected URI: ', uri)
    try {
      const decodedPath = decodeURIComponent(uri.replace(/\%3A/g, '/').replace(/\%2F/g, '/')); 
      // console.info('Decoded URI: ', decodedPath)
      setSelectedPath(decodedPath);
    } catch (error) {
      console.error('Error decoding path:', error);
    }
  };

  const handleSavePress = () => {
    if(selectedPath){
      onSavePath(selectedPath);
    }
    onClose();
    setSelectedPath('');
  };
  const handleCancelPress = () => {
    onClose();
    setSelectedPath('');
  };

  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style = {{color: 'yellow', marginBottom: 10, textTransform: 'uppercase'}}>Choose Path to save pictures</Text>
          
          {/* <TouchableOpacity
            style={styles.chooseAlbumButton}
             // Call the album picker function
          >
            <Text style={styles.buttonText}>Choose Album</Text>
          </TouchableOpacity>
          {selectedAlbum && (
            <TextInput
              style={styles.pathInput}
              placeholder="Selected Album Path"
              value={selectedAlbum}
              editable={false}
            />
          )} */}
          
          <DocumentPickerComponent onDirectorySelected={handleDirectorySelected}/>
          {selectedPath !== '' && (
            <TextInput
              style={styles.pathInput}
              placeholder="Selected Path"
              value={selectedPath}
              editable={true}
            />
          )}
          <View style = {styles.saveCloseButtons}>
            <TouchableOpacity onPress={handleCancelPress}>
              <Text style = {{color: 'white', backgroundColor: 'red', padding: 3}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSavePress}>
              <Text style = {{color: 'white', backgroundColor: 'green', padding: 3}}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 20,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  saveCloseButtons:{
    justifyContent: 'space-between',
    alignContent: 'center',
    flexDirection: 'row',
    marginTop: 15
  },
  pathInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    color: 'yellow'
  },
  chooseAlbumButtonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chooseAlbumButton: {
    backgroundColor: 'pink',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: 'black',
  },
});

export default StorageModal;


