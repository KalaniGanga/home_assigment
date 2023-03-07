import data from './data.json';

const getPage = () =>
	new Promise((res, rej) => {
		setTimeout(() => res(data), 500);
	});

export default getPage;
