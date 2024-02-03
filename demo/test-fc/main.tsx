/* eslint-disable linebreak-style */
import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
function App() {
	const [f, setF] = useState(1);
	return (
		<div>
			<h1>{f}</h1>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
