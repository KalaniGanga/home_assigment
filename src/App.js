import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Container from '@material-ui/core/Container';
import './App.css';
import getPage from './api/content';

const useStyles = makeStyles((theme) => ({
	selected: {
		border: "2px solid #FE365F",
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	mainContent: {
		backgroundColor: theme.palette.background.paper,
		padding: theme.spacing(8, 0, 6),
	},
	card: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	cardMedia: {
		paddingTop: '100%',
	},
	cardAction: {
		display: 'block',
		textAlign: 'initial'
	},
	movieDetails: {
		marginTop: '3px',
		justifyContent: 'center'
	},
	clearButton: {
		marginTop: '8px'
	},
	actorText: {
		marginTop: '10px'
	},
	textPrimary: {
		fontWeight: 600
	},
	textSelectMovie: {
		marginTop: '100px',
		marginBottom: '100px',
		fontWeight: 600
	},
	similarList: {
		marginTop: '20px'
	},
	textIsSimilar: {
		fontSize: 40,
	},
	similarText: {
		fontSize: 15,
		fontWeight: 600
	}

}));


function App() {
	const [movies, setMovies] = useState({});
	const [selectedMovie, setSelectedMovie] = useState([]);
	const [imageBaseUrl, setImageBaseUrl] = useState('');
	const [showComparisson, setShowComparisson] = useState(false);
	const [isSimilar, setIsSimilar] = useState('No');
	const [rating, setRating] = useState('');
	const [parentalRating, setParentalRating] = useState('');
	const [commonActors, setCommonActors] = useState([]);
	const [duration, setDuration] = useState('');
	const [year, setYear] = useState('');
	const [selectedId, setselectedId] = useState([]);

	const classes = useStyles();

	/** get movie details */
	const setMovieData = () => {
		getPage().then((data) => {
			setMovies(data.blocks[0].products);
			let imageObj = data.blocks[0].templates.find(item => item.type === 'image');
			setImageBaseUrl(imageObj.href.replace('{title}', ''));
		})
	}

	useEffect(() => {
		setMovieData();
	}, [])

	useEffect(() => {
		if (selectedMovie.length === 2) {
			setShowComparisson(true);
			findSimilarity();
		} else {
			setShowComparisson(false);
		}
	}, [selectedMovie])


	const clearSelection = () => {
		setSelectedMovie([]);
		setShowComparisson(false);
		setIsSimilar('No');
		setYear('');
		setRating('');
		setParentalRating('');
		setDuration('');
		setCommonActors([]);
		setselectedId([]);
	}

	/** convert milliseconds to hour */
	const convertMstoHr = (ms) => {
		let hours = ms / (1000 * 60 * 60);
		return hours.toFixed(2);
	}

	/** find similarity of the selected two movie */
	const findSimilarity = () => {
		/** check if atleaset two main params are similar */
		let similar = (selectedMovie[0].production.year === selectedMovie[1].production.year && selectedMovie[0].parentalRating === selectedMovie[1].parentalRating) ? 'Yes' : 'No';
		if (similar == 'Yes') {
			setParentalRating(`Parental Rating: ${selectedMovie[0].parentalRating}`)
			setYear(`Production year: ${selectedMovie[0].production.year}`);
			let rating = selectedMovie[0].imdb ? (selectedMovie[0].imdb.rating === selectedMovie[1].imdb.rating ? Math.floor(selectedMovie[0].imdb.rating) : null) : null;
			setRating(rating ? `imdb rating: ${rating}` : '');
			let movie1Duration = convertMstoHr(selectedMovie[0].duration.milliseconds);
			let movie2Duration = convertMstoHr(selectedMovie[1].duration.milliseconds);
			let duration = (movie1Duration < 1 && movie2Duration < 1) ? `Duration < 1hr` : (1 < movie1Duration && movie1Duration < 2 && 1 < movie2Duration && movie2Duration < 2) ? `1 hr ≤ Duration < 2 hrs` : ((2 < movie1Duration && 2 < movie2Duration) ? `Duration ≥ 2 hrs` : '');
			setDuration(duration);
			let actors = (typeof selectedMovie[0].people.actors !== 'undefined' && typeof selectedMovie[1].people.actors !== 'undefined') ? selectedMovie[0].people.actors.filter(name => selectedMovie[1].people.actors.includes(name)) : [];
			setCommonActors(actors);
		}
		setIsSimilar(similar);
	}

	const onMovieSelect = (card, id) => {
		if (selectedMovie.length !== 2) {
			const isSelectedSameMovie = selectedMovie.some(obj => obj.guid === card.guid);
			if (!isSelectedSameMovie) {
				setSelectedMovie([...selectedMovie, card]);
				setselectedId([...selectedId, id]);
			}

		} else {
			setShowComparisson(true);
		}
	}
	return (
		<React.Fragment>
			<CssBaseline />
			<main>
				<div className={classes.mainContent}>
					<Container>
						<Typography variant="h3" align="center" className={classes.textPrimary} >
							Are these similar?
						</Typography>
						<Grid container spacing={3} className={classes.similarList}>
							<Grid item xs={3}>
								{showComparisson ?
									<Card className={classes.card}>
										<CardMedia
											className={classes.cardMedia}
											image={imageBaseUrl + selectedMovie[0].title}
											title={selectedMovie[0].title}
										/>
									</Card>
									: null}
							</Grid>
							<Grid item xs={6}>
								{showComparisson ?
									<div>
										<Typography variant="h6" align="center" className={classes.textIsSimilar}>
											{isSimilar}
										</Typography>
										{isSimilar ?
											<Grid container className={classes.movieDetails}>
												<Grid item container>
													<Typography color="textSecondary" className={classes.similarText}>
														{year}
													</Typography>
												</Grid>
												<Grid item container>
													<Typography color="textSecondary" className={classes.similarText}>
														{parentalRating}
													</Typography>
												</Grid>
												<Grid item container>
													<Typography color="textSecondary" className={classes.similarText}>
														{rating}
													</Typography>
												</Grid>
												<Grid item container >
													<Typography color="textSecondary" className={classes.similarText}>
														{duration}
													</Typography>
												</Grid>
												{commonActors.length ?
													<Grid item container className={classes.actorText}>
														<Typography color="textSecondary" className={classes.similarText}>
															Actors
														</Typography>
														<Typography variant="h7" color="textSecondary">
															{commonActors.join(', ')}
														</Typography>
													</Grid> : null}
											</Grid>
											: null}
										<Grid container justifyContent="center">
											<Button variant="contained" color="secondary" className={classes.clearButton} onClick={() => clearSelection()}>
												clear selection
											</Button>
										</Grid>
									</div>
									: <Typography variant="h6" align="center" paragraph className={classes.textSelectMovie}>
										Select two movies below to see their similarities
									</Typography>}

							</Grid>
							<Grid item xs={3}>
								{showComparisson ?
									<Card className={classes.card}>
										<CardMedia
											className={classes.cardMedia}
											image={imageBaseUrl + selectedMovie[1].title}
											title={selectedMovie[1].title}
										/>
									</Card>
									: null}
							</Grid>
						</Grid>
					</Container>
				</div>

				<Container>
					<Grid container spacing={2}>
						{movies.length ?
							movies.map((card, id) => (
								<Grid item key={card.guid} xs={12} md={3}>
									<Card className={selectedId.includes(id) ? classes.selected : classes.card}>
										<ButtonBase className={classes.cardAction} onClick={() => onMovieSelect(card, id)}>
											<CardMedia
												className={classes.cardMedia}
												image={imageBaseUrl + card.title}
												title={card.title}
											/>
										</ButtonBase>
									</Card>
								</Grid>
							)) : null}
					</Grid>
				</Container>
			</main>
		</React.Fragment >
	);
}

export default App;
