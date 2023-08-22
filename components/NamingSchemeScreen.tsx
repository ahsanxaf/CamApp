import React, {useState} from "react";
import {
View, 
Text,
TextInput,
TouchableOpacity,
StyleSheet,
ToastAndroid,
} from 'react-native';
import CheckBox from "@react-native-community/checkbox";
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import { CameraNamingScheme } from "../types/NamingSchemeTypes";
import { RootStackParamList } from "../navigations/AppNavigator";
import { useNamingScheme } from "./NamingSchemeContext";


type NamingSchemeScreenRouteProp = RouteProp<RootStackParamList, 'NamingSchemeScreen'>;
const NamingSchemeScreen: React.FC<{route: NamingSchemeScreenRouteProp}> = ({route}) => {
    const [useDateTime, setUseDateTime] = useState(true);
    const [useSequence, setUseSequence] = useState(false);
    const [sequence, setSequence] = useState('');
    const [prefix, setPrefix] = useState('');
    const [sequenceError, setSequenceError] = useState("");
    const { namingScheme, setNamingScheme } = useNamingScheme();


    const navigation = useNavigation();
    // const route = useRoute();

    const handleSave = () => {

        if(useSequence){
            if(!sequence){
                setSequenceError('Sequence cannot be blank');
                return;
            }
            else if(!/^[a-zA-Z0-9]+$/.test(sequence)){
                setSequenceError("Sequence can only contain letters and numbers");
                return;
            }
        }

        // let updatedNamingScheme: CameraNamingScheme = {
        //     type: (useDateTime && useSequence) ? 'datetime & sequence' : 
        //           (useDateTime ? 'datetime' : 'sequence'),
        //     prefix,
        //     sequence
        // };

        let updatedNamingScheme: CameraNamingScheme;
        if (useDateTime && useSequence) {
            updatedNamingScheme = {
                type: 'datetime & sequence',
                prefix,
                sequence
            };
        } else if (useDateTime) {
            updatedNamingScheme = {
                type: 'datetime',
                prefix
            };
        } else if (useSequence) {
            updatedNamingScheme = {
                type: 'sequence',
                prefix,
                sequence
            };
           
        }else{
            updatedNamingScheme = {
                type: 'datetime',
                prefix,
            };
        }

        setNamingScheme(updatedNamingScheme);

        navigation.goBack();
        ToastAndroid.showWithGravity('Naming Scheme has been updated', ToastAndroid.SHORT, ToastAndroid.CENTER)

       
    };
    return(
        <View style = {styles.container}>
            <View style = {styles.headingContainer}>
                <Text style = {styles.textHeader}>Select Naming Scheme</Text>
            </View>
            <View style={styles.checkBoxContainer}>
                <CheckBox
                value={useDateTime}
                onValueChange={() => {
                    setUseDateTime(!useDateTime);
                    // setUseSequence(false);
                }}
                tintColors={{ true: '#34ebd8', false: 'grey' }}/>

                <Text style = {styles.checkboxLabel}>Use Current Date and Time</Text>
            </View>
            <View style = {styles.checkBoxContainer}>
                <CheckBox
                value={useSequence}
                onValueChange={() => {
                    setUseSequence(!useSequence);
                    // setUseDateTime(false);
                }}
                tintColors={{ true: '#34ebd8', false: 'grey' }}
                />

                <Text style = {styles.checkboxLabel}>Use Sequence</Text>
            </View>
            {useSequence && (
                <View>
                    <TextInput
                    style={[styles.input, useSequence && sequenceError ? styles.inputError : null]}
                    placeholder="Enter Sequence"
                    value={sequence}
                    onChangeText={(newSequence) => {
                        setSequence(newSequence);
                        setSequenceError(""); // Clear the error when the user starts typing
                    }}/>
                    {sequenceError ? <Text style={styles.errorText}>{sequenceError}</Text> : null}
                </View> 
            )}
            <TextInput
                style={styles.input}
                placeholder="Enter Prefix"
                value={prefix}
                onChangeText={setPrefix}
            />

            <TouchableOpacity style = {styles.saveButton} onPress={handleSave}>
                <Text style = {{color: 'white'}}>Save</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        // backgroundColor: 'rgba(0, 0, 0, .3)',
    },

    input: {
        height: 40,
        borderColor: 'grey',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        color: 'black',

    },
    saveButton: {
        backgroundColor: 'blue',
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
    },

    checkboxLabel: {
        color: 'black',
        fontSize: 20,
    },

    headingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },

    checkBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    textHeader: {
        fontSize: 25,
        fontWeight: '600',
        color: '#34ebd8',
        textTransform: 'uppercase'
    },
    inputError: {
        borderColor: "red",
    },

    errorText: {
        color: "red",
        marginBottom: 8,
    },
    
});

export  default NamingSchemeScreen;