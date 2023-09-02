import React, { useEffect } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraQuality } from '../types/Types';

interface QualityModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectQuality: (quality: CameraQuality) => void;
    SelectedQuality: CameraQuality;
}

const QualityModal: React.FC<QualityModalProps> = ({ visible, onClose, onSelectQuality, SelectedQuality }) => {
    
    const [selectedQuality, setSelectedQuality] = React.useState<CameraQuality>('medium');
    
    useEffect(() => {
        setSelectedQuality(selectedQuality);
    }, [selectedQuality]);

    const handleSaveButtonPress = () => {
        onClose();
        onSelectQuality(selectedQuality);
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.qualityModalContainer}>
                <View style={styles.qualityModalContent}>
                    <View style={styles.qualityButtonsContainer}>
                        <TouchableOpacity style={[styles.qualityButtons, selectedQuality === 'low' && styles.selectedQuality]} onPress={() => setSelectedQuality('low')}>
                            <Text style={styles.buttonText}>Low Quality</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.qualityButtons, selectedQuality === 'medium' && styles.selectedQuality]} onPress={() => setSelectedQuality('medium')}>
                            <Text style={styles.buttonText}>Medium Quality</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.qualityButtons, selectedQuality === 'high' && styles.selectedQuality]} onPress={() => setSelectedQuality('high')}>
                            <Text style={styles.buttonText}>High Quality</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveButtonPress}>
                            <Text style={{color: 'white'}}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={{color: 'white'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    qualityModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    qualityModalContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 20,
        borderRadius: 8,
    },
    saveButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 8,
    },
    cancelButton:{
        marginTop: 10,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 8,
    },
    qualityButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        padding: '1%'
    },
    qualityButtons:{
        margin: '1.5%',
        borderRadius: 5,
        padding: 5,
        borderWidth: 1,
        borderColor: 'gray',
        alignItems: 'center',
        opacity: 0.5,
    },
    buttonsContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        margin: 15
    },
    buttonText: {
        color: 'white',
        textTransform: 'uppercase'
    },
    selectedQuality: {
        backgroundColor: 'orange', // Customize the color for selected quality
        opacity: 1,
    },
});

export default QualityModal;
