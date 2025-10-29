# Notification System

Le système de notifications permet d'afficher des messages de succès, d'erreur, d'information et d'avertissement sous forme de notifications toast modernes.

## Utilisation

### 1. Importer le hook

```javascript
import { useNotification } from '../../contexts/NotificationContext'
```

### 2. Utiliser dans votre composant

```javascript
export const MyComponent = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification()

  const handleSubmit = async () => {
    try {
      // ... votre code ...
      showSuccess('Opération réussie !')
    } catch (error) {
      showError('Une erreur est survenue')
    }
  }
}
```

## Fonctions disponibles

### `showSuccess(message, duration?)`
Affiche une notification de succès.

- `message` (string): Le message à afficher
- `duration` (number, optionnel): Durée en millisecondes avant auto-fermeture (défaut: 5000ms, 0 = pas d'auto-fermeture)

### `showError(message, duration?)`
Affiche une notification d'erreur.

### `showInfo(message, duration?)`
Affiche une notification d'information.

### `showWarning(message, duration?)`
Affiche une notification d'avertissement.

### `showNotification(message, type, duration?)`
Fonction générique pour afficher une notification avec un type personnalisé.

- `type`: 'success' | 'error' | 'info' | 'warning'

## Exemples

```javascript
// Notification de succès (disparaît après 5 secondes)
showSuccess('Profil mis à jour avec succès !')

// Notification d'erreur (disparaît après 5 secondes)
showError('Erreur lors de la sauvegarde')

// Notification qui reste jusqu'à fermeture manuelle
showInfo('Opération en cours...', 0)

// Notification personnalisée
showWarning('Attention: Cette action est irréversible', 10000)
```

## Remplacement des messages statiques

Avant:
```javascript
const [error, setError] = useState('')
const [success, setSuccess] = useState('')

// Dans le JSX
{error && <div className="error">{error}</div>}
{success && <div className="success">{success}</div>}
```

Après:
```javascript
const { showSuccess, showError } = useNotification()

// Plus besoin de state pour error/success
// Plus besoin de JSX pour les afficher
showSuccess('Succès !')
showError('Erreur !')
```

## Composants utilisant déjà les notifications

- `ProfilePage.jsx`
- `SettingsPage.jsx`

## Ajouter dans d'autres composants

Pour ajouter les notifications dans d'autres composants (ClientsTable, InvoicesTable, etc.), suivez le même pattern :

1. Importez `useNotification`
2. Remplacez `useState` pour error/success par `showSuccess`/`showError`
3. Supprimez les blocs JSX d'affichage statique des messages
4. Appelez les fonctions de notification à la place de `setError`/`setSuccess`
