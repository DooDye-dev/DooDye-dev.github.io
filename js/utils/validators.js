/**
 * Validators for exercise and quiz validation
 */

const Validators = {
  validateHtml: (userCode, expected) => {
    if (!userCode) {
      return { isValid: false, message: 'Le code est vide.' };
    }

    if (!expected) {
      return { isValid: true, message: 'Exercice validé.' };
    }

    if (expected.tags) {
      for (const tag of expected.tags) {
        if (!this.containsTag(userCode, tag)) {
          return {
            isValid: false,
            message: `La balise <${tag}> est manquante.`
          };
        }
      }
    }

    if (expected.text) {
      if (typeof expected.text === 'string') {
        if (!userCode.includes(expected.text)) {
          return {
            isValid: false,
            message: `Le texte "${expected.text}" est manquant.`
          };
        }
      } else if (Array.isArray(expected.text)) {
        for (const text of expected.text) {
          if (!userCode.includes(text)) {
            return {
              isValid: false,
              message: `Le texte "${text}" est manquant.`
            };
          }
        }
      }
    }

    if (expected.structure) {
      const structure = this.extractHtmlStructure(userCode);
      if (structure !== expected.structure) {
        return {
          isValid: false,
          message: `La structure HTML ne correspond pas.`
        };
      }
    }

    if (expected.attributes) {
      for (const [tag, attrs] of Object.entries(expected.attributes)) {
        for (const [attr, value] of Object.entries(attrs)) {
          if (!this.hasAttribute(userCode, tag, attr, value)) {
            return {
              isValid: false,
              message: `L'attribut ${attr}="${value}" est manquant sur la balise <${tag}>.`
            };
          }
        }
      }
    }

    return { isValid: true, message: 'Exercice validé !' };
  },

  validateCss: (userCode, expected) => {
    if (!userCode) {
      return { isValid: false, message: 'Le code CSS est vide.' };
    }

    if (!expected) {
      return { isValid: true, message: 'Exercice validé.' };
    }

    if (expected.selectors) {
      for (const selector of expected.selectors) {
        if (!this.containsSelector(userCode, selector)) {
          return {
            isValid: false,
            message: `Le sélecteur "${selector}" est manquant.`
          };
        }
      }
    }

    if (expected.properties) {
      for (const property of expected.properties) {
        if (!this.containsCssProperty(userCode, property)) {
          return {
            isValid: false,
            message: `La propriété "${property}" est manquante.`
          };
        }
      }
    }

    if (expected.propertyValues) {
      for (const [property, value] of Object.entries(expected.propertyValues)) {
        if (!this.hasPropertyValue(userCode, property, value)) {
          return {
            isValid: false,
            message: `La propriété "${property}" n'a pas la valeur "${value}".`
          };
        }
      }
    }

    return { isValid: true, message: 'Exercice validé !' };
  },

  validateJs: (userCode, expected) => {
    if (!userCode) {
      return { isValid: false, message: 'Le code JavaScript est vide.' };
    }

    if (!expected) {
      return { isValid: true, message: 'Exercice validé.' };
    }

    if (expected.functions) {
      for (const func of expected.functions) {
        if (!this.containsFunction(userCode, func)) {
          return {
            isValid: false,
            message: `La fonction "${func}" est manquante.`
          };
        }
      }
    }

    if (expected.variables) {
      for (const variable of expected.variables) {
        if (!this.containsVariable(userCode, variable)) {
          return {
            isValid: false,
            message: `La variable "${variable}" est manquante.`
          };
        }
      }
    }

    if (expected.keywords) {
      for (const keyword of expected.keywords) {
        if (!userCode.includes(keyword)) {
          return {
            isValid: false,
            message: `Le mot-clé "${keyword}" est manquant.`
          };
        }
      }
    }

    return { isValid: true, message: 'Exercice validé !' };
  },

  validateQuiz: (userAnswer, correctAnswer) => {
    if (userAnswer === undefined || userAnswer === null) {
      return { isValid: false, message: 'Aucune réponse sélectionnée.' };
    }

    if (userAnswer === correctAnswer) {
      return { isValid: true, message: 'Bonne réponse !' };
    }

    return { isValid: false, message: 'Réponse incorrecte.' };
  },

  containsTag: (html, tag) => {
    if (!html) return false;
    const tagRegex = new RegExp(`<${tag}[\\s>]`, 'i');
    return tagRegex.test(html);
  },

  hasAttribute: (html, tag, attr, value) => {
    if (!html) return false;
    const regex = value
      ? new RegExp(`<${tag}[^>]*${attr}\\s*=\\s*["']${value}["'][^>]*>`, 'i')
      : new RegExp(`<${tag}[^>]*${attr}\\s*=\\s*["'][^"']*["'][^>]*>`, 'i');
    return regex.test(html);
  },

  containsSelector: (css, selector) => {
    if (!css) return false;
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedSelector}\\s*\\{`);
    return regex.test(css);
  },

  hasPropertyValue: (css, property, value) => {
    if (!css) return false;
    const regex = new RegExp(`${property}\\s*:\\s*${value}\\s*;`, 'i');
    return regex.test(css);
  },

  containsFunction: (js, func) => {
    if (!js) return false;
    const regex = new RegExp(`function\\s+${func}\\s*\\(\\s*\\)`, 'i');
    return regex.test(js);
  },

  containsVariable: (js, variable) => {
    if (!js) return false;
    const regex = new RegExp(`(var|let|const)\\s+${variable}\\s*[=;]`, 'i');
    return regex.test(js);
  },

  containsCssProperty: (css, property) => {
    if (!css) return false;
    const regex = new RegExp(`${property}\\s*:`, 'i');
    return regex.test(css);
  },

  validateStructure: (html, structure) => {
    if (!html || !structure) return false;
    const tags = structure.split('>');
    let currentHtml = html;

    for (const tag of tags) {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'is');
      const match = currentHtml.match(regex);
      if (!match) return false;
      currentHtml = match[1];
    }
    return true;
  },

  validateNesting: (html, nesting) => {
    if (!html || !nesting) return true;

    for (const [parent, children] of Object.entries(nesting)) {
      const parentRegex = new RegExp(`<${parent}[^>]*>(.*?)</${parent}>`, 'is');
      const parentMatch = html.match(parentRegex);

      if (parentMatch) {
        const parentContent = parentMatch[1];
        for (const child of children) {
          if (!this.containsTag(parentContent, child)) {
            return false;
          }
        }
      }
    }
    return true;
  },

  validateCssRules: (css, rules) => {
    if (!css || !rules) return true;

    for (const [selector, properties] of Object.entries(rules)) {
      for (const [property, value] of Object.entries(properties)) {
        if (!this.hasPropertyValue(css, property, value)) {
          return false;
        }
      }
    }
    return true;
  },

  validateJsLogic: (js, logic) => {
    if (!js || !logic) return true;

    for (const [keyword, shouldExist] of Object.entries(logic)) {
      const exists = js.includes(keyword);
      if (shouldExist && !exists) return false;
      if (!shouldExist && exists) return false;
    }
    return true;
  },

  createCustomValidator: (validationFn) => {
    return (userCode, expected) => {
      try {
        const result = validationFn(userCode, expected);
        if (typeof result === 'boolean') {
          return {
            isValid: result,
            message: result ? 'Exercice validé !' : 'Exercice non validé.'
          };
        }
        return result;
      } catch (error) {
        return {
          isValid: false,
          message: `Erreur de validation : ${error.message}`
        };
      }
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validators;
}