import { useState } from 'react'
import LightRays from '../components/backgrounds/lightrays'
import { useNavigate } from 'react-router-dom' // Add this import
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { API_CONFIG } from '@/config/api'

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToMarketing, setAgreeToMarketing] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate() // Add this hook
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500); // Redirect after 1.5s
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Logo */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#00ffff"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.7}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays"
          />
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-6xl font-cal font-bold text-foreground mb-4">
            Ticketeer
          </h1>
          <p className="text-xl text-muted-foreground">
            Join the community of event creators
          </p>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-cal font-bold text-foreground">
              Ticketeer
            </h1>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-cal font-bold text-foreground mb-2">
              Sign Up
            </h2>
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-foreground hover:underline font-medium">
                Log in
              </a>
            </p>
          </div>

          {/* Signup form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <div className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                    placeholder="Daniel"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                    placeholder="Ihemegbulem"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  placeholder="danielihemegbulem"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  placeholder="dihemegbulem@gmail.com"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-foreground">
                  Phone Number
                </Label>
                <div className="flex mt-1">
                  <div className="flex items-center px-3 bg-accent/20 border border-r-0 border-border rounded-l-md">
                    <span className="text-sm">🇺🇸</span>
                    <span className="ml-1 text-muted-foreground text-sm">+1</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground rounded-l-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground pr-10"
                    placeholder="••••••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground pr-10"
                    placeholder="••••••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-5">
                  I have read and agree to the{' '}
                  <a href="#" className="text-foreground hover:underline">
                    Terms of Service
                  </a>{' '}
                  &{' '}
                  <a href="#" className="text-foreground hover:underline">
                    Privacy Policy
                  </a>
                  .
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="marketing" 
                  checked={agreeToMarketing}
                  onCheckedChange={(checked) => setAgreeToMarketing(checked as boolean)}
                />
                <Label htmlFor="marketing" className="text-sm text-muted-foreground leading-5">
                  By checking this box, you authorize Ticketeer and organizers of the 
                  events you register for to send you automated informational and 
                  marketing texts to the number entered above. Your consent is not a 
                  condition of any purchase. Messages may be sent any time of day 
                  and message frequency varies. Msg & data rates may apply. Reply 
                  STOP to unsubscribe.
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full py-3 text-lg font-semibold"
              disabled={!agreeToTerms || loading}
            >
              {loading ? 'Registering...' : 'Join Ticketeer'}
            </Button>
          </form>

          {/* Social signup */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent/20"
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent/20"
              >
                Apple
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup