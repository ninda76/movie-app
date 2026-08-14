import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import en from "../Locales/en";
import id from "../Locales/id";


const LanguageContext = createContext(null);


const translations = {
    en,
    id,
};


/*
|--------------------------------------------------------------------------
| Get nested translation
|--------------------------------------------------------------------------
|
| Contoh:
|
| t("movie.title")
|
| akan mengambil:
|
| translations.en.movie.title
|
|--------------------------------------------------------------------------
*/

function getTranslation(object, path) {

    const keys = path.split(".");

    let value = object;

    for (const key of keys) {

        if (
            value &&
            Object.prototype.hasOwnProperty.call(value, key)
        ) {
            value = value[key];
        } else {
            return null;
        }
    }

    return value;
}


export function LanguageProvider({ children }) {

    const [language, setLanguage] = useState(() => {

        const savedLanguage =
            localStorage.getItem("language");

        if (
            savedLanguage === "id" ||
            savedLanguage === "en"
        ) {
            return savedLanguage;
        }

        return "en";
    });


    useEffect(() => {

        localStorage.setItem(
            "language",
            language
        );

    }, [language]);


    const changeLanguage = (newLanguage) => {

        if (
            newLanguage !== "en" &&
            newLanguage !== "id"
        ) {
            return;
        }

        setLanguage(newLanguage);
    };


    const t = (key, fallback = null) => {

        const currentTranslations =
            translations[language];

        const translated =
            getTranslation(
                currentTranslations,
                key
            );


        /*
        |--------------------------------------------------------------------------
        | Jika translation ditemukan
        |--------------------------------------------------------------------------
        */

        if (
            translated !== null &&
            translated !== undefined
        ) {
            return translated;
        }


        /*
        |--------------------------------------------------------------------------
        | Jika tidak ditemukan, coba English
        |--------------------------------------------------------------------------
        */

        const englishTranslation =
            getTranslation(
                translations.en,
                key
            );


        if (
            englishTranslation !== null &&
            englishTranslation !== undefined
        ) {
            return englishTranslation;
        }


        /*
        |--------------------------------------------------------------------------
        | Fallback terakhir
        |--------------------------------------------------------------------------
        */

        if (fallback !== null) {
            return fallback;
        }


        return key;
    };


    const value = {
        language,
        setLanguage: changeLanguage,
        changeLanguage,
        t,
    };


    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}


export function useLanguage() {

    const context =
        useContext(LanguageContext);


    if (!context) {

        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }


    return context;
}


export default LanguageContext;