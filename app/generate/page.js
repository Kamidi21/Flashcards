'use client';

import { useState } from 'react'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { doc, collection, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Generate() {
  const [text, setText] = useState('')
  const [flashcards, setFlashcards] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { isLoaded, isSignedIn, user } = useUser()
  const [flipped, setFlipped] = useState([]) // Track flipped cards
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const data = await response.json()
      setFlashcards(data.flashcards)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('An error occurred while generating flashcards. Please try again.')
    }
  }

  const handleOpenDialog = () => setDialogOpen(true)
  const handleCloseDialog = () => setDialogOpen(false)

  const handleCardClick = (index) => {
    setFlipped((prevFlipped) => {
      const updatedFlipped = [...prevFlipped]
      updatedFlipped[index] = !updatedFlipped[index]
      return updatedFlipped
    })
  }

  const saveFlashcards = async () => {
    console.log('Save Flashcards function called');
    
    if (!name) {
      console.log('No name provided');
      alert('Please enter a name');
      return;
    }
  
    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, 'users'), user.id);
    console.log('User Document Reference:', userDocRef.path);
  
    try {
      const docSnap = await getDoc(userDocRef);
      let collections = [];
  
      if (docSnap.exists()) {
        console.log('User document exists');
        collections = docSnap.data().flashcards || [];
        
        if (collections.find((f) => f.name === name)) {
          console.log('Flashcard collection with this name already exists');
          alert('A flashcard collection with the same name already exists');
          return;
        } else {
          collections.push({ name });
          console.log('Adding new flashcard set name to collections');
          batch.set(userDocRef, { flashcards: collections }, { merge: true });
        }
      } else {
        console.log('User document does not exist, creating new document');
        batch.set(userDocRef, { flashcards: [{ name }] });
      }
  
      const colRef = collection(userDocRef, name);
      console.log('Creating collection reference:', colRef.path);
  
      flashcards.forEach((flashcard, index) => {
        const cardDocRef = doc(colRef);
        console.log(`Setting flashcard ${index} in collection`, cardDocRef.path);
        batch.set(cardDocRef, flashcard);
      });
  
      await batch.commit();
      console.log('Batch commit successful');
      
      handleCloseDialog();
      router.push('/flashcards');
      console.log('Redirected to /flashcards');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert('An error occurred while saving flashcards. Please try again.');
    }
  }
  

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate Flashcards
        </Typography>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Enter text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          Generate Flashcards
        </Button>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Generated Flashcards
          </Typography>
          <Grid container spacing={2}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card onClick={() => handleCardClick(index)} sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Typography>
                      {flipped[index] ? flashcard.back : flashcard.front}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* {flashcards.length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              Save Flashcards
            </Button>
          </Box>
        )} */}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              Save Flashcards
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="default">
            Cancel
          </Button>
          <Button onClick={saveFlashcards} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

