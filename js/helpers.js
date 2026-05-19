var Helpers = (function(){
    function getVFDuration(value, isRest) {
      if(value === 4) return isRest ? "wr" : "w";
      else if(value === 3) return isRest ? "hr" : "h";
      else if(value === 2) return isRest ? "hr" : "h";
      else if(value === 1) return isRest ? "qr" : "q";
      else if(value === 0.5) return isRest ? "8r" : "8";
    }
  
    function convertNoteToItalian(key) {
      if(!key) return "";
      var letter = key.split("/")[0].toLowerCase();
      var mapping = {
        c: "do",
        d: "re",
        e: "mi",
        f: "fa",
        g: "sol",
        a: "la",
        b: "si"
      };
      return mapping[letter] || "";
    }
  
    function stringToArray(str, size) {
      var result = new Array(size).fill("");
      if(!str) return result;
      if(str.toLowerCase() === "sol") {
        if(size > 1) {
          result[0] = "So";
          for(var i = 1; i < size - 1; i++){
            result[i] = "o";
          }
          result[size - 1] = "ol";
        } else {
          result[0] = "Sol";
        }
      } else {
        var vowels = str.match(/[aeiouAEIOU]/g) || [];
        result[0] = str;
        for(var i = 1; i < size; i++){
          result[i] = vowels[(i - 1) % vowels.length] || "";
        }
      }
      return result;
    }
  
    function getSolSyllables(size, isFirstHalf, isSecondHalf) {
      let result = new Array(size);
      if(size === 1) {
        result[0] = "Sol";
      } else {
        result[0] = "So";
        for(let i = 1; i < size - 1; i++){
          result[i] = "o";
        }
        result[size - 1] = "ol";
      }
      if(isFirstHalf) {
        if(size === 1) {
          result[0] = "So";
        } else {
          result[size - 1] = "o";
        }
      }
      if(isSecondHalf) {
        if(size === 1) {
          result[0] = "Ol";
        } else {
          result[0] = "o";
        }
      }
      return result;
    }
  
    function getElementFromMap(map, i, j) {
      var vector = map.get(i);
      if(vector && j >= 0 && j < vector.length) {
        return vector[j];
      } else {
        return "";
      }
    }
  
    return {
      getVFDuration: getVFDuration,
      convertNoteToItalian: convertNoteToItalian,
      stringToArray: stringToArray,
      getSolSyllables: getSolSyllables,
      getElementFromMap: getElementFromMap
    };
  })();
  