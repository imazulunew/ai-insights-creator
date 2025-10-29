const { authenticate } = require('./auth');
   const { processEmails } = require('./process-gmail');

   async function run() {
     try {
       console.log('Starting Gmail automation...\n');
       
       const auth = await authenticate();
       const results = await processEmails(auth);
       
       console.log('\n✓ Processing complete!');
       console.log('Emails processed:', results.processed);
       console.log('Insights generated:', results.insights);
       
       process.exit(0);
     } catch (error) {
       console.error('❌ Fatal error:', error.message);
       console.error(error);
       process.exit(1);
     }
   }

   run();
