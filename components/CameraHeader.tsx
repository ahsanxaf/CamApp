import React from "react";
import {View, TouchableOpacity, StyleSheet, Image, Text} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

interface CameraHeaderProps{
    onPressSettings: () => void;
    onPressFlashToggle: () => void;
    flashMode: "auto" | "on" | "off" | "torch";
}

const CameraHeader: React.FC<CameraHeaderProps> = ({onPressSettings, onPressFlashToggle, flashMode}) => {
    return(
        <View style={styles.header}>
            <TouchableOpacity onPress={onPressFlashToggle}>
                {/* <Icon name="settings-outline" size={24} color="white"/> */}
                <Image source = {flashMode==="off" ? require('../assets/flashoff_icon.png') : require('../assets/flash_icon.png')}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressSettings}>
                {/* <Icon name="setting" size={24} color="white"/> */}
                <Image source={require('../assets/settings_icon.png')}/>
            </TouchableOpacity>  
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        padding: 7,
        height: '7%',
        backgroundColor: 'black',
        elevation: 4,
        shadowColor: '#000',
        justifyContent: 'space-between',
        alignItems: 'center',
        top: 0,
    },
    flex: {
        flex: 1,
    },
    settingsButton: {
        height: '30%',
        width: '7%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'

    },
    flashOnButton: {
        height: '30%',
        width: '7%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    }
});

export default CameraHeader;