import {seedIfEmpty} from '../lib/db';
async function main(){await seedIfEmpty();console.log('ResQ development data is ready.')}
main();
