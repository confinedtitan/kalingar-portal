import { useRef, useCallback, useEffect } from 'react';
import { useTamilMode } from '../components/TamilContext';

// Comprehensive English → Tamil phonetic transliteration map
// Sorted by longest key first so longer sequences match before shorter ones
const TRANSLITERATION_MAP = [
    // Special combined consonants
    ['shri', 'ஸ்ரீ'],
    ['sri', 'ஸ்ரீ'],

    // Consonant clusters
    ['ksh', 'க்ஷ'],
    ['thr', 'த்ர'],
    ['nch', 'ஞ்ச'],
    ['ngh', 'ங்'],
    ['nth', 'ந்த'],
    ['ndr', 'ந்த்ர'],

    // Aspirated / digraph consonant + vowel combos
    // Cha series (ச)
    ['chaa', 'சா'], ['chai', 'சை'], ['chau', 'சௌ'],
    ['cha', 'ச'], ['chi', 'சி'], ['chee', 'சீ'], ['chu', 'சு'], ['choo', 'சூ'],
    ['che', 'சே'], ['cho', 'சோ'], ['ch', 'ச்'],

    // Sha series (ஷ)
    ['shaa', 'ஷா'], ['shai', 'ஷை'], ['shau', 'ஷௌ'],
    ['sha', 'ஷ'], ['shi', 'ஷி'], ['shee', 'ஷீ'], ['shu', 'ஷு'], ['shoo', 'ஷூ'],
    ['she', 'ஷே'], ['sho', 'ஷோ'], ['sh', 'ஷ்'],

    // Tha series (த) — "th" maps to த
    ['thaa', 'தா'], ['thai', 'தை'], ['thau', 'தௌ'],
    ['tha', 'த'], ['thi', 'தி'], ['thee', 'தீ'], ['thu', 'து'], ['thoo', 'தூ'],
    ['the', 'தே'], ['tho', 'தோ'], ['th', 'த்'],

    // Dha series (த)
    ['dhaa', 'தா'], ['dhai', 'தை'], ['dhau', 'தௌ'],
    ['dha', 'த'], ['dhi', 'தி'], ['dhee', 'தீ'], ['dhu', 'து'], ['dhoo', 'தூ'],
    ['dhe', 'தே'], ['dho', 'தோ'], ['dh', 'த்'],

    // Bha series (ப)
    ['bhaa', 'பா'], ['bhai', 'பை'], ['bhau', 'பௌ'],
    ['bha', 'ப'], ['bhi', 'பி'], ['bhee', 'பீ'], ['bhu', 'பு'], ['bhoo', 'பூ'],
    ['bhe', 'பே'], ['bho', 'போ'], ['bh', 'ப்'],

    // Gha series (க)
    ['ghaa', 'கா'], ['ghai', 'கை'], ['ghau', 'கௌ'],
    ['gha', 'க'], ['ghi', 'கி'], ['ghee', 'கீ'], ['ghu', 'கு'], ['ghoo', 'கூ'],
    ['ghe', 'கே'], ['gho', 'கோ'], ['gh', 'க்'],

    // Kha series (க)
    ['khaa', 'கா'], ['khai', 'கை'], ['khau', 'கௌ'],
    ['kha', 'க'], ['khi', 'கி'], ['khee', 'கீ'], ['khu', 'கு'], ['khoo', 'கூ'],
    ['khe', 'கே'], ['kho', 'கோ'], ['kh', 'க்'],

    // Pha series (ப)
    ['phaa', 'பா'], ['phai', 'பை'], ['phau', 'பௌ'],
    ['pha', 'ப'], ['phi', 'பி'], ['phee', 'பீ'], ['phu', 'பு'], ['phoo', 'பூ'],
    ['phe', 'பே'], ['pho', 'போ'], ['ph', 'ப்'],

    // Jha series (ஜ)
    ['jhaa', 'ஜா'], ['jhai', 'ஜை'], ['jhau', 'ஜௌ'],
    ['jha', 'ஜ'], ['jhi', 'ஜி'], ['jhee', 'ஜீ'], ['jhu', 'ஜு'], ['jhoo', 'ஜூ'],
    ['jhe', 'ஜே'], ['jho', 'ஜோ'], ['jh', 'ஜ்'],

    // Zh series (ழ)
    ['zhaa', 'ழா'], ['zhai', 'ழை'], ['zhau', 'ழௌ'],
    ['zha', 'ழ'], ['zhi', 'ழி'], ['zhee', 'ழீ'], ['zhu', 'ழு'], ['zhoo', 'ழூ'],
    ['zhe', 'ழே'], ['zho', 'ழோ'], ['zh', 'ழ்'],

    // Ng series (ங)
    ['ngaa', 'ஙா'], ['ngai', 'ஙை'], ['ngau', 'ஙௌ'],
    ['nga', 'ங'], ['ngi', 'ஙி'], ['ngee', 'ஙீ'], ['ngu', 'ஙு'], ['ngoo', 'ஙூ'],
    ['nge', 'ஙே'], ['ngo', 'ஙோ'], ['ng', 'ங்'],

    // Ny series (ஞ)
    ['nyaa', 'ஞா'], ['nyai', 'ஞை'], ['nyau', 'ஞௌ'],
    ['nya', 'ஞ'], ['nyi', 'ஞி'], ['nyee', 'ஞீ'], ['nyu', 'ஞு'], ['nyoo', 'ஞூ'],
    ['nye', 'ஞே'], ['nyo', 'ஞோ'], ['ny', 'ஞ்'],

    // Two-letter stand-alone vowels
    ['aa', 'ஆ'], ['ee', 'ஈ'], ['ii', 'ஈ'], ['oo', 'ஊ'], ['uu', 'ஊ'],
    ['ai', 'ஐ'], ['au', 'ஔ'], ['ou', 'ஔ'],

    // Ka series (க)
    ['kaa', 'கா'], ['kai', 'கை'], ['kau', 'கௌ'],
    ['ka', 'க'], ['ki', 'கி'], ['kee', 'கீ'], ['ku', 'கு'], ['koo', 'கூ'],
    ['ke', 'கே'], ['ko', 'கோ'], ['k', 'க்'],

    // Ga series (க)
    ['gaa', 'கா'], ['gai', 'கை'], ['gau', 'கௌ'],
    ['ga', 'க'], ['gi', 'கி'], ['gee', 'கீ'], ['gu', 'கு'], ['goo', 'கூ'],
    ['ge', 'கே'], ['go', 'கோ'], ['g', 'க்'],

    // Sa series (ச)
    ['saa', 'சா'], ['sai', 'சை'], ['sau', 'சௌ'],
    ['sa', 'ச'], ['si', 'சி'], ['see', 'சீ'], ['su', 'சு'], ['soo', 'சூ'],
    ['se', 'சே'], ['so', 'சோ'], ['s', 'ச்'],

    // Ca series (ச)
    ['caa', 'சா'], ['cai', 'சை'], ['cau', 'சௌ'],
    ['ca', 'ச'], ['ci', 'சி'], ['cee', 'சீ'], ['cu', 'சு'], ['coo', 'சூ'],
    ['ce', 'சே'], ['co', 'சோ'], ['c', 'ச்'],

    // Ja series (ஜ)
    ['jaa', 'ஜா'], ['jai', 'ஜை'], ['jau', 'ஜௌ'],
    ['ja', 'ஜ'], ['ji', 'ஜி'], ['jee', 'ஜீ'], ['ju', 'ஜு'], ['joo', 'ஜூ'],
    ['je', 'ஜே'], ['jo', 'ஜோ'], ['j', 'ஜ்'],

    // Ta series (ட)
    ['taa', 'டா'], ['tai', 'டை'], ['tau', 'டௌ'],
    ['ta', 'ட'], ['ti', 'டி'], ['tee', 'டீ'], ['tu', 'டு'], ['too', 'டூ'],
    ['te', 'டே'], ['to', 'டோ'], ['t', 'ட்'],

    // Da series (ட)
    ['daa', 'டா'], ['dai', 'டை'], ['dau', 'டௌ'],
    ['da', 'ட'], ['di', 'டி'], ['dee', 'டீ'], ['du', 'டு'], ['doo', 'டூ'],
    ['de', 'டே'], ['do', 'டோ'], ['d', 'ட்'],

    // Na series (ந)
    ['naa', 'நா'], ['nai', 'நை'], ['nau', 'நௌ'],
    ['na', 'ந'], ['ni', 'நி'], ['nee', 'நீ'], ['nu', 'நு'], ['noo', 'நூ'],
    ['ne', 'நே'], ['no', 'நோ'], ['n', 'ந்'],

    // Pa series (ப)
    ['paa', 'பா'], ['pai', 'பை'], ['pau', 'பௌ'],
    ['pa', 'ப'], ['pi', 'பி'], ['pee', 'பீ'], ['pu', 'பு'], ['poo', 'பூ'],
    ['pe', 'பே'], ['po', 'போ'], ['p', 'ப்'],

    // Ba series (ப)
    ['baa', 'பா'], ['bai', 'பை'], ['bau', 'பௌ'],
    ['ba', 'ப'], ['bi', 'பி'], ['bee', 'பீ'], ['bu', 'பு'], ['boo', 'பூ'],
    ['be', 'பே'], ['bo', 'போ'], ['b', 'ப்'],

    // Ma series (ம)
    ['maa', 'மா'], ['mai', 'மை'], ['mau', 'மௌ'],
    ['ma', 'ம'], ['mi', 'மி'], ['mee', 'மீ'], ['mu', 'மு'], ['moo', 'மூ'],
    ['me', 'மே'], ['mo', 'மோ'], ['m', 'ம்'],

    // Ya series (ய)
    ['yaa', 'யா'], ['yai', 'யை'], ['yau', 'யௌ'],
    ['ya', 'ய'], ['yi', 'யி'], ['yee', 'யீ'], ['yu', 'யு'], ['yoo', 'யூ'],
    ['ye', 'யே'], ['yo', 'யோ'], ['y', 'ய்'],

    // Ra series (ர)
    ['raa', 'ரா'], ['rai', 'ரை'], ['rau', 'ரௌ'],
    ['ra', 'ர'], ['ri', 'ரி'], ['ree', 'ரீ'], ['ru', 'ரு'], ['roo', 'ரூ'],
    ['re', 'ரே'], ['ro', 'ரோ'], ['r', 'ர்'],

    // La series (ல)
    ['laa', 'லா'], ['lai', 'லை'], ['lau', 'லௌ'],
    ['la', 'ல'], ['li', 'லி'], ['lee', 'லீ'], ['lu', 'லு'], ['loo', 'லூ'],
    ['le', 'லே'], ['lo', 'லோ'], ['l', 'ல்'],

    // Va series (வ)
    ['vaa', 'வா'], ['vai', 'வை'], ['vau', 'வௌ'],
    ['va', 'வ'], ['vi', 'வி'], ['vee', 'வீ'], ['vu', 'வு'], ['voo', 'வூ'],
    ['ve', 'வே'], ['vo', 'வோ'], ['v', 'வ்'],

    // Wa series (= Va)
    ['waa', 'வா'], ['wai', 'வை'], ['wau', 'வௌ'],
    ['wa', 'வ'], ['wi', 'வி'], ['wee', 'வீ'], ['wu', 'வு'], ['woo', 'வூ'],
    ['we', 'வே'], ['wo', 'வோ'], ['w', 'வ்'],

    // Ha series (ஹ)
    ['haa', 'ஹா'], ['hai', 'ஹை'], ['hau', 'ஹௌ'],
    ['ha', 'ஹ'], ['hi', 'ஹி'], ['hee', 'ஹீ'], ['hu', 'ஹு'], ['hoo', 'ஹூ'],
    ['he', 'ஹே'], ['ho', 'ஹோ'], ['h', 'ஹ்'],

    // Fa series (ஃப)
    ['faa', 'ஃபா'], ['fai', 'ஃபை'], ['fau', 'ஃபௌ'],
    ['fa', 'ஃப'], ['fi', 'ஃபி'], ['fee', 'ஃபீ'], ['fu', 'ஃபு'], ['foo', 'ஃபூ'],
    ['fe', 'ஃபே'], ['fo', 'ஃபோ'], ['f', 'ஃப்'],

    // Stand-alone vowels
    ['a', 'அ'],
    ['i', 'இ'],
    ['u', 'உ'],
    ['e', 'எ'],
    ['o', 'ஒ'],
];

/**
 * Transliterate an English string into Tamil using phonetic mapping.
 * Processes the input left-to-right, matching the longest key at each position.
 */
function transliterate(input) {
    let result = '';
    let i = 0;
    const lower = input.toLowerCase();

    while (i < lower.length) {
        let matched = false;

        for (const [key, value] of TRANSLITERATION_MAP) {
            if (lower.startsWith(key, i)) {
                result += value;
                i += key.length;
                matched = true;
                break;
            }
        }

        // Numbers, spaces, punctuation pass through unchanged
        if (!matched) {
            result += input[i];
            i++;
        }
    }

    return result;
}

/**
 * Custom hook for Tamil transliteration using an English buffer approach.
 *
 * Instead of transliterating the displayed value (which is already Tamil),
 * this hook maintains a hidden English buffer. Every keystroke modifies the
 * English buffer, which is then fully re-transliterated to produce the
 * displayed Tamil text. This means the text dynamically changes as more
 * letters are typed — just like GBoard.
 *
 * Example: typing "k" shows "க்", then typing "a" changes it to "க"
 *
 * Returns { onChange, onKeyDown } — spread both onto the input element.
 */
export function useTamilInput(value, setValue) {
    const { tamilMode } = useTamilMode();
    const englishRef = useRef('');
    const prevTamilMode = useRef(tamilMode);

    // When tamil mode is toggled, handle buffer transition
    useEffect(() => {
        if (prevTamilMode.current !== tamilMode) {
            prevTamilMode.current = tamilMode;
            if (tamilMode) {
                // Switching to Tamil: start with empty english buffer
                // (existing text stays as-is, new typing will be Tamil)
                englishRef.current = '';
            }
        }
    }, [tamilMode]);

    // When value is externally cleared (form reset), clear buffer too
    useEffect(() => {
        if (value === '' || value === undefined || value === null) {
            englishRef.current = '';
        }
    }, [value]);

    const handleKeyDown = useCallback((e) => {
        if (!tamilMode) return; // let default behavior handle English mode

        const key = e.key;

        // Handle Backspace — remove last character from English buffer
        if (key === 'Backspace') {
            e.preventDefault();
            if (englishRef.current.length > 0) {
                englishRef.current = englishRef.current.slice(0, -1);
                setValue(transliterate(englishRef.current));
            }
            return;
        }

        // Handle Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X and other shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) {
            // Allow Ctrl+A (select all), but prevent Ctrl+V paste (we handle it in onPaste)
            return;
        }

        // Let navigation keys, Enter, Tab, Escape pass through
        if (key === 'Enter' || key === 'Tab' || key === 'Escape' ||
            key.startsWith('Arrow') || key === 'Home' || key === 'End' ||
            key === 'PageUp' || key === 'PageDown' || key === 'Delete' ||
            key === 'Insert' || key === 'F1' || key === 'F2' || key === 'F3' ||
            key === 'F4' || key === 'F5' || key === 'F6' || key === 'F7' ||
            key === 'F8' || key === 'F9' || key === 'F10' || key === 'F11' ||
            key === 'F12' || key === 'Shift' || key === 'Control' ||
            key === 'Alt' || key === 'Meta' || key === 'CapsLock' ||
            key === 'NumLock' || key === 'ScrollLock') {
            return;
        }

        // For printable characters, prevent default and handle via buffer
        if (key.length === 1) {
            e.preventDefault();
            englishRef.current += key;
            setValue(transliterate(englishRef.current));
        }
    }, [tamilMode, setValue]);

    const handleChange = useCallback((e) => {
        if (!tamilMode) {
            // In English mode, pass through directly
            englishRef.current = e.target.value;
            setValue(e.target.value);
        }
        // In Tamil mode, handleKeyDown manages the value — onChange is a no-op
    }, [tamilMode, setValue]);

    return { onChange: handleChange, onKeyDown: handleKeyDown };
}

export { transliterate };
