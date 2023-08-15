import React, { useState } from "react";
import {View, TouchableOpacity, Text, StyleSheet, Modal, Dimensions, useWindowDimensions} from 'react-native';
import {RNCameraProps} from 'react-native-camera'
import Icon from 'react-native-vector-icons/FontAwesome';
import QualityPreviewFrame from "./QualityPreviewFrame";


type CameraQuality = 'low' | 'medium' | 'high';
interface SettingsModalProps{
    visible: boolean;
    selectedQuality: CameraQuality
    onClose: () => void;
    onQualitySelect: (selectedQuality: CameraQuality) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    selectedQuality,
    onClose,
    onQualitySelect
}) => {

    const [showQualityOptions, setShowQualityOptions] = useState(false);
    const handleQualityButtonPress = () => {
        onClose();
        setShowQualityOptions(true);
        
    };
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const modalContentWidth = windowWidth/2;
    const modalContentHeight = windowHeight * 0.5;

    const handleOverlayPress = () => {
        onClose();
    }

    // const dynamicStyles = StyleSheet.flatten({
    //     modalContent: {
    //       width: modalContentWidth/2,
    //       height: modalContentHeight
    //     },
    // });
    
    return(
        <View>
            <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
                <TouchableOpacity style={{flex: 1}} onPress={handleOverlayPress} activeOpacity={1}>
                    <View style={[Styles.modalContainer, {height: modalContentHeight}]}>
                        <TouchableOpacity style={Styles.qualityButton} onPress={handleQualityButtonPress}>
                            {/* <Icon name="cog" size={30} color='white'/> */}
                            <Text style={Styles.qualityButtonText}>Quality Options</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Flash</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Storage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Water Mark</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Sound</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.modalButtonDesign}>
                            <Text style={Styles.modalButtonTextDesign}>Framing Lines</Text>
                        </TouchableOpacity>
                        
                    </View>
                </TouchableOpacity>
            </Modal>
            <QualityPreviewFrame
                visible={showQualityOptions}
                selectedQuality={selectedQuality}
                onClose={() => setShowQualityOptions(false)}
                onQualitySelect={onQualitySelect}/>
        </View>
    );
};

const Styles = StyleSheet.create({
    modalButtonDesign: {
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginTop: 20,
        borderRadius: 20
    },
    modalButtonTextDesign:{
        fontSize: 18,
        color: 'yellow',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        height: '50%',
        marginTop: 55,
        },
    qualityButton: {
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 20,
        justifyContent:'flex-start'
    },
    qualityButtonText: {
        fontSize: 18,
        color: 'yellow',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        padding: 16,
    },
    settingModalParentView: {

    },
});

export default SettingsModal;
