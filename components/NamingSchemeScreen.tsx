import React, {useEffect, useState} from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Picker} from '@react-native-picker/picker';

type NamingSchemeScreenRouteProp = RouteProp<RootStackParamList, 'NamingSchemeScreen'>;
const NamingSchemeScreen: React.FC<{route: NamingSchemeScreenRouteProp}> = ({route}) => {
    const [useDateTime, setUseDateTime] = useState(true);
    const [useSequence, setUseSequence] = useState(false);
    const [sequence, setSequence] = useState('');
    const [prefix, setPrefix] = useState('');
    const [sequenceError, setSequenceError] = useState("");
    const { namingScheme, setNamingScheme } = useNamingScheme();
    const [isSaveEnabled, setIsSaveEnabled] = useState(true);
    const [previousSchemes, setPreviousSchemes] = useState<CameraNamingScheme[]>([]);
    const [selectedPreviousScheme, setSelectedPreviousScheme] = useState('');
    const [showTextInput, setShowTextInput] = useState(true);


    const navigation = useNavigation();

    useEffect(() => {
        // Load previously selected naming schemes from AsyncStorage
        const loadPreviousSchemes = async () => {
            try {
                const schemesJson = await AsyncStorage.getItem('previousSchemes');
                if (schemesJson) {
                    const schemes = JSON.parse(schemesJson) as CameraNamingScheme[];
                    setPreviousSchemes(schemes);
                }
            } catch (error) {
                console.error('Error loading previous schemes:', error);
            }
        };

        loadPreviousSchemes();
    }, []);

    useEffect(() => {
        if (!useDateTime && !useSequence) {
            setIsSaveEnabled(false);
        } else {
            setIsSaveEnabled(true);
        }
    }, [useDateTime, useSequence]);

    useEffect(() => {
        if (namingScheme.type === 'datetime') {
            setUseDateTime(true);
            setUseSequence(false);
        } else if (namingScheme.type === 'sequence') {
            setUseDateTime(false);
            setUseSequence(true);
            setSequence(namingScheme.sequence || '');
        } else if (namingScheme.type === 'datetime & sequence') {
            setUseDateTime(true);
            setUseSequence(true);
            setSequence(namingScheme.sequence || '');
        }
        setPrefix(namingScheme.prefix);
    }, [namingScheme]);
    const handleSave = () => {

        if(useSequence){
            if(!sequence){
                setSequenceError('Sequence cannot be blank');
                return;
            }
            else if(!/^[0-9]+$/.test(sequence)){
                setSequenceError("Sequence can only contain numbers");
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


        let newScheme;
    
        if (useDateTime && useSequence) {
            newScheme = {
                type: 'datetime & sequence',
                prefix,
                sequence
            };
        } else if (useDateTime) {
            newScheme = {
                type: 'datetime',
                prefix
            };
        } else if (useSequence) {
            newScheme = {
                type: 'sequence',
                prefix,
                sequence
            };
        }
        
        const updatedSchemes = [...previousSchemes, newScheme];
        AsyncStorage.setItem('previousSchemes', JSON.stringify(updatedSchemes))
        .then(() => {
            console.log('Previous schemes updated in AsyncStorage');
        })
        .catch((error) => {
            console.error('Error updating previous schemes:', error);
        });

        navigation.goBack();
        ToastAndroid.showWithGravity('Naming Scheme has been updated ', ToastAndroid.SHORT, ToastAndroid.CENTER)

       
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
            <TextInput
                style={styles.input}
                placeholder="Enter Prefix"
                value={prefix}
                onChangeText={setPrefix}
            />
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
            <Picker
                selectedValue={selectedPreviousScheme}
                onValueChange={(itemValue) => {
                    setSelectedPreviousScheme(itemValue);
                    const selectedScheme = previousSchemes.find((scheme) => scheme.type === itemValue);
                    if (selectedScheme) {
                        if (selectedScheme.type === 'datetime') {
                            setUseDateTime(true);
                            setUseSequence(false);
                        } else if (selectedScheme.type === 'sequence') {
                            setUseDateTime(false);
                            setUseSequence(true);
                            setSequence(selectedScheme.sequence || '');
                        } else if (selectedScheme.type === 'datetime & sequence') {
                            setUseDateTime(true);
                            setUseSequence(true);
                            setSequence(selectedScheme.sequence || '');
                        }
                        setPrefix(selectedScheme.prefix);
                        setShowTextInput(selectedScheme.type === 'sequence');
                    }
                }}
            >
                <Picker.Item label="Select a previous scheme" value="" />
                {previousSchemes.map((scheme) => (
                    <Picker.Item key={scheme.type} label={scheme.type} value={scheme.type} />
                ))}
            </Picker>

            <TouchableOpacity 
                style = {[styles.saveButton, {backgroundColor: isSaveEnabled ? 'blue' : 'grey'}]} 
                onPress={handleSave} 
                disabled = {!isSaveEnabled}>
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