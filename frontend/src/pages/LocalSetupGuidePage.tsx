import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, AlertCircle, CheckCircle2, XCircle, FileCode, Copy } from 'lucide-react';

export default function LocalSetupGuidePage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Local Development Setup</h1>
          <p className="text-lg text-muted-foreground">
            Follow these instructions to run this project on your local machine
          </p>
        </div>

        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-bold">MERN Stack Not Supported</AlertTitle>
          <AlertDescription className="space-y-2">
            <p className="font-semibold">
              This project does NOT use and cannot generate a MERN (MongoDB, Express.js, React, Node.js) stack.
            </p>
            <p>
              The following technologies are <strong>not supported</strong> in this repository:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Node.js</strong> backend server</li>
              <li><strong>Express.js</strong> framework</li>
              <li><strong>MongoDB</strong> database</li>
              <li><strong>JWT (JSON Web Token)</strong> authentication</li>
              <li><strong>bcrypt.js</strong> password encryption</li>
              <li><strong>Google Maps API</strong> or GPS/geolocation services</li>
            </ul>
            <p className="mt-2">
              Instead, this project runs on the <strong>Internet Computer blockchain</strong> using a Motoko canister backend with Internet Identity authentication. See the "Supported Stack" section below for details on what this project actually uses, and follow the dfx-based setup instructions to run it locally.
            </p>
          </AlertDescription>
        </Alert>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-primary" />
              Command Checklist (Copy/Paste)
            </CardTitle>
            <CardDescription>
              Quick reference: all commands needed to run this project locally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Pay attention to which directory each command should be run from.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    From project root
                  </span>
                  <h4 className="font-semibold text-sm">1. Install dfx (one-time setup)</h4>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                    From frontend/
                  </span>
                  <h4 className="font-semibold text-sm">2. Install frontend dependencies</h4>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  npm install
                </div>
                <p className="text-xs text-muted-foreground">or</p>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  pnpm install
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    From project root
                  </span>
                  <h4 className="font-semibold text-sm">3. Start the local replica</h4>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  dfx start --background
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    From project root
                  </span>
                  <h4 className="font-semibold text-sm">4. Deploy canisters</h4>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  dfx deploy
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                    From frontend/
                  </span>
                  <h4 className="font-semibold text-sm">5. Start the frontend dev server</h4>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  npm run dev
                </div>
                <p className="text-xs text-muted-foreground">or</p>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  pnpm dev
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    From project root
                  </span>
                  <h4 className="font-semibold text-sm">6. Stop the local replica (when done)</h4>
                </div>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                  dfx stop
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                After completing steps 1-5, your app should be running at{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                  http://localhost:3000
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Running, compiling, and deploying the Internet Computer (ICP) backend locally requires{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dfx</code>. Without it,
            the Motoko canister backend will not run.
          </AlertDescription>
        </Alert>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-accent" />
              Project Code (Where to Find It)
            </CardTitle>
            <CardDescription>Key source code locations in this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Backend Source</h4>
              <div className="rounded-md bg-muted p-3 font-mono text-sm">
                backend/main.mo
              </div>
              <p className="text-sm text-muted-foreground">
                The Motoko canister backend containing all server-side logic, data storage, and API endpoints.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Frontend Source</h4>
              <div className="rounded-md bg-muted p-3 font-mono text-sm">
                frontend/src/
              </div>
              <p className="text-sm text-muted-foreground">
                The React + TypeScript frontend directory containing all UI components, pages, hooks, and styles.
              </p>
            </div>

            <Alert>
              <FileCode className="h-4 w-4" />
              <AlertDescription>
                To view or modify the code, open these files in your editor (e.g., VS Code). To run the project locally, follow the dfx setup instructions below.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5" id="supported-stack">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Supported Stack (This Project)
            </CardTitle>
            <CardDescription>Technologies used in this Internet Computer application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Backend</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Motoko canister backend</strong> – All backend logic runs in a canister on the
                  Internet Computer
                </li>
                <li>
                  <strong>Canister-stored data</strong> – User profiles, jobs, and applications are
                  persisted directly in the canister (no external database)
                </li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Frontend</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>React + TypeScript</strong> – Component-based UI with type safety
                </li>
                <li>
                  <strong>Tailwind CSS</strong> – Utility-first styling framework
                </li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Authentication</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Internet Identity</strong> – Decentralized authentication system for the
                  Internet Computer (no passwords or JWT tokens)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Not Supported Here
            </CardTitle>
            <CardDescription>
              Technologies NOT used in this Internet Computer canister project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This project does not use traditional web2 backend technologies. It runs entirely on the
                Internet Computer blockchain.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Backend Technologies (Not Used)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Node.js / Express.js</strong> – Not used; backend is a Motoko canister, not a
                  Node.js server
                </li>
                <li>
                  <strong>MongoDB</strong> – Not used; data is stored directly in the canister, not in an
                  external database
                </li>
                <li>
                  <strong>Firebase / Render / Vercel backend hosting</strong> – Not applicable; the
                  backend canister is deployed to the Internet Computer network
                </li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Authentication & Security (Not Used)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>JWT (JSON Web Token)</strong> – Not used; authentication is handled by Internet
                  Identity
                </li>
                <li>
                  <strong>bcrypt.js / password encryption</strong> – Not used; Internet Identity is
                  passwordless
                </li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Location Services (Not Used)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Google Maps API</strong> – Not used; location matching is based on user-entered
                  area text, not GPS coordinates or mapping services
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card id="dfx-setup">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              macOS / Linux Setup
            </CardTitle>
            <CardDescription>For Unix-based operating systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Step 1: Install dfx</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Run the following command in your terminal:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">
                sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 2: Verify installation</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Check that dfx is installed correctly:</p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">dfx --version</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 3: Install frontend dependencies</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                  From frontend/
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Navigate to the frontend directory and install dependencies:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">cd frontend</div>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">npm install</div>
              <p className="text-xs text-muted-foreground">or</p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">pnpm install</div>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">cd ..</div>
              <p className="text-xs text-muted-foreground">(Return to project root for next steps)</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 4: Start the local replica</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Start the Internet Computer local network in the background:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">dfx start --background</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 5: Deploy the canisters</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Deploy your backend and frontend canisters:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">dfx deploy</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 6: Start the development server</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                  From frontend/
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Navigate to the frontend directory and run the development server:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">cd frontend</div>
              <div className="space-y-2">
                <div className="rounded-md bg-muted p-4 font-mono text-sm">npm run dev</div>
                <p className="text-xs text-muted-foreground">or</p>
                <div className="rounded-md bg-muted p-4 font-mono text-sm">pnpm dev</div>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your app should now be running at{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                  http://localhost:3000
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Windows Setup (via WSL)
            </CardTitle>
            <CardDescription>
              Windows users must use Windows Subsystem for Linux (WSL)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dfx</code> does not
                run natively on Windows. You must install and use WSL (Windows Subsystem for Linux).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="font-semibold">Step 1: Install WSL</h3>
              <p className="text-sm text-muted-foreground">
                Open PowerShell as Administrator and run:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">wsl --install -d ubuntu</div>
              <p className="text-sm text-muted-foreground">
                Your PC will restart after installation completes.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 2: Open Ubuntu terminal</h3>
              <p className="text-sm text-muted-foreground">
                After restart, open Ubuntu from the Start menu. The WSL terminal will launch.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 3: Install dfx inside WSL</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root (in WSL)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Inside the Ubuntu (WSL) terminal, run:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">
                sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 4: Verify installation</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root (in WSL)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Check that dfx is installed correctly:</p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">dfx --version</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 5: Navigate to your project</h3>
              <p className="text-sm text-muted-foreground">
                In the WSL terminal, navigate to your project directory. Windows drives are accessible
                at <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/mnt/c/</code>
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">
                cd /mnt/c/path/to/your/project
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 6: Install frontend dependencies</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                  From frontend/ (in WSL)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Navigate to the frontend directory and install dependencies:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">cd frontend</div>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">npm install</div>
              <p className="text-xs text-muted-foreground">or</p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">pnpm install</div>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">cd ..</div>
              <p className="text-xs text-muted-foreground">(Return to project root for next steps)</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 7: Start the local replica</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root (in WSL)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Inside the WSL terminal, start the Internet Computer local network:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">dfx start --background</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 8: Deploy the canisters</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  From project root (in WSL)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Deploy your backend and frontend canisters:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">dfx deploy</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Step 9: Start the development server</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                  From frontend/ (in WSL)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Navigate to the frontend directory and run the development server:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">cd frontend</div>
              <div className="space-y-2">
                <div className="rounded-md bg-muted p-4 font-mono text-sm">npm run dev</div>
                <p className="text-xs text-muted-foreground">or</p>
                <div className="rounded-md bg-muted p-4 font-mono text-sm">pnpm dev</div>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your app should now be running at{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                  http://localhost:3000
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • All <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dfx</code>{' '}
              commands (start, deploy, stop) must be run from your <strong>project root directory</strong>.
            </p>
            <p>
              • Frontend dependency installation and dev server commands must be run from the{' '}
              <strong>frontend/ directory</strong>.
            </p>
            <p>
              • Windows users must run all commands inside the WSL (Ubuntu) terminal, not in PowerShell
              or Command Prompt.
            </p>
            <p>
              • To stop the local replica, run{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">dfx stop</code> from
              the project root.
            </p>
            <p>
              • For more information, visit the{' '}
              <a
                href="https://internetcomputer.org/docs/current/developer-docs/getting-started/install"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                official Internet Computer documentation
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
