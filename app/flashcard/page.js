'use client';
import jsPDF from 'jspdf';


import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box,Button } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { collection, doc, getDocs,getDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Update this path according to your project structure
import { useSearchParams } from 'next/navigation';

export default function FlashcardSetPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    async function getFlashcardSet() {
      if (!search || !user) return;

      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(colRef);
      const fetchedFlashcards = [];
      docs.forEach((doc) => {
        fetchedFlashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(fetchedFlashcards);
    }
    getFlashcardSet();
  }, [search, user]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleDownload = () => {
    const doc = new jsPDF();
  
    flashcards.forEach((flashcard, index) => {
      doc.setFontSize(16);
      doc.text(`Q${index + 1}: ${flashcard.front}`, 10, 10 + (index * 20)); // Question
      doc.text(`A${index + 1}: ${flashcard.back}`, 10, 20 + (index * 20));  // Answer
  
      // Add a new page for every pair of question and answer if needed
      if (index !== flashcards.length - 1) {
        doc.addPage();
      }
    });
  
    doc.save(`flashcards_${search}.pdf`);
  };
  return (
    <Container maxWidth="md">
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {flashcards.map((flashcard) => (
          <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
            <Card>
              <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                <CardContent>
                  <Box sx={{ position: 'relative', width: '100%', height: '100px', perspective: '1000px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: '0.6s', transform: `rotateY(${flipped[flashcard.id] ? '180deg' : '0'})` }}>
                      <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
                        <Typography variant="h5" component="div">
                          {flashcard.front}
                        </Typography>
                      </div>
                      <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <Typography variant="h5" component="div">
                          {flashcard.back}
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Download Button at the Bottom */}
      <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Download Flashcards
        </Button>
      </Box>
    </Container>
  );
}