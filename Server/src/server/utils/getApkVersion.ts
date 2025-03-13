import axios from 'axios';

export const getApkVersion = async () => {
  const Regex = /AF_initDataCallback\({key:\s*'ds:5'.*?data:([\s\S]*?), sideChannel:.+<\/script/;
  try {
    const response = await axios.get('https://play.google.com/store/apps/details?id=com.app.tgtg&hl=en&gl=US');

    const match = Regex.exec(response.data);

    if (match && match[1]) {
      const data = JSON.parse(match[1]);

      return data[1][2][140][0][0][0];
    } else {
      return 'No match found';
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return null;
  }
}
