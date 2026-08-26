const fs = require('fs');
const file = 'lib/desktop-notifications.ts';
let content = fs.readFileSync(file, 'utf8');

// We will change the try block for serviceWorker
content = content.replace(/if \('serviceWorker' in navigator\) \{[\s\S]*?\} catch \(err\) \{/m, `if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        await registration.showNotification(title, { 
          body, 
          icon, 
          tag: tag || 'socasob-eye-alert', 
          requireInteraction,
          vibrate: [200, 100, 200]
        });
        return true;
      }
    }
  } catch (err) {`);

fs.writeFileSync(file, content);
console.log('Done fix notification SW block');
