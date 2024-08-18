'use client';
import { useState } from 'react';
import { Container, Box, Button, Typography, AppBar, Toolbar, Menu, MenuItem, IconButton } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Head from 'next/head';
import getStripe from '@/utils/get-stripe';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Home() {
  const { isSignedIn } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleGetStarted = () => {
    if (isSignedIn) {
      window.location.href = '/generate';
    } else {
      window.location.href = '/sign-in';
    }
  };

  const handleSubmit = async (planType) => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType }), // Pass the selected planType
    });
    const checkoutSessionJson = await checkoutSession.json();
    
    if (checkoutSession.statuscode === 500) {
      console.error(checkoutSession.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePlanSelect = (planType) => {
    handleSubmit(planType);
    handleMenuClose();
  };

  return (
    <Container maxWidth="lg">
      <Head>
        <title>AIFlashLearn</title>
        <meta name="description" content="Revolutionize Your Learning with AI-Powered Flashcards" />
      </Head>

      {/* Header and Navigation */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', boxShadow: 'none', pt: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'left', fontWeight: 'bold', color: 'black' }}>
            AIFlashLearn
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              href="/" 
              sx={{ 
                mr: 2, 
                backgroundColor: '#9c27b0', 
                color: 'white', 
                borderColor: '#9c27b0',
                '&:hover': { 
                  backgroundColor: '#7b1fa2', 
                  borderColor: '#7b1fa2' 
                } 
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              onClick={handleMenuClick} 
              sx={{ 
                mr: 2, 
                backgroundColor: '#9c27b0', 
                color: 'white', 
                borderColor: '#9c27b0',
                display: 'flex',
                alignItems: 'center',
                '&:hover': { 
                  backgroundColor: '#7b1fa2', 
                  borderColor: '#7b1fa2' 
                } 
              }}
            >
              Pricing
              <ArrowDropDownIcon sx={{ ml: 1 }} />
            </Button>
            <SignedOut>
              <Button 
                color="inherit" 
                href="/sign-in" 
                sx={{ 
                  mr: 2, 
                  backgroundColor: '#9c27b0', 
                  color: 'white', 
                  borderColor: '#9c27b0',
                  '&:hover': { 
                    backgroundColor: '#7b1fa2', 
                    borderColor: '#7b1fa2' 
                  } 
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                href="/sign-up" 
                sx={{ 
                  backgroundColor: '#9c27b0', 
                  color: 'white', 
                  borderColor: '#9c27b0',
                  '&:hover': { 
                    backgroundColor: '#7b1fa2', 
                    borderColor: '#7b1fa2' 
                  } 
                }}
              >
                Sign Up
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section with Background Image */}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: "url('/Home.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}
        >
          Revolutionize Your Learning with AI-Powered Flashcards
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ 
            mt: 2, 
            px: 4, 
            backgroundColor: '#9c27b0', 
            color: 'white', 
            '&:hover': { 
              backgroundColor: '#7b1fa2' 
            } 
          }}
          onClick={handleGetStarted}
        >
          Get Started for Free
        </Button>
      </Box>

      {/* Pricing Dropdown Menu */}
      <Menu
        id="pricing-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handlePlanSelect('basic')}>Basic Plan - $0/month</MenuItem>
        <MenuItem onClick={() => handlePlanSelect('pro')}>Pro Plan - $10/month</MenuItem>
      </Menu>
    </Container>
  );
}
