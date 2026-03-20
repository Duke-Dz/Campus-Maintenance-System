import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  });
});

test("login page is branded and validates required fields", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle("Sign in | CampusFix");
  await expect(page.getByRole("heading", { name: "Sign in to CampusFix" })).toBeVisible();
  await expect(page.locator('[data-auth-logo="true"]')).toHaveCount(1);

  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Enter your username.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
});

test("register page shows compact password guidance on first input", async ({ page }) => {
  await page.goto("/register");

  await expect(page).toHaveTitle("Create account | CampusFix");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.locator('[data-auth-logo="true"]')).toHaveCount(1);

  await page.locator('input[name="password"]').fill("A");

  await expect(page.locator('[data-password-checklist="true"]')).toBeVisible();
  await expect(page.getByText("Still needed")).toBeVisible();
  await expect(page.getByText("At least 10 characters")).toBeVisible();
  await expect(page.getByText("Lowercase letter")).toBeVisible();
  await expect(page.getByText("Number")).toBeVisible();
  await expect(page.getByText("Special character")).toBeVisible();
  await expect(page.getByText("Uppercase letter")).toHaveCount(0);
});

test("register page accepts non-campus email domains", async ({ page }) => {
  let payload = null;

  await page.route("**/api/auth/username-suggestions**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ suggestions: [] }),
    });
  });

  await page.route("**/api/auth/register", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "If the details are eligible, check your email for a verification link." }),
    });
  });

  await page.goto("/register");

  await page.locator('input[name="username"]').fill("studentmail");
  await page.locator('input[name="email"]').fill("student@gmail.com");
  await page.locator('input[name="fullName"]').fill("Student Mail");
  await page.locator('input[name="password"]').fill("CampusFix!2026");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect.poll(() => payload).not.toBeNull();
  expect(payload).toMatchObject({
    username: "studentmail",
    email: "student@gmail.com",
    fullName: "Student Mail",
    password: "CampusFix!2026",
    captchaToken: "playwright-captcha-token",
  });
  await expect(page).toHaveURL(/\/verify-email\?email=student%40gmail\.com/);
});

test("forgot password page validates email input", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page).toHaveTitle("Reset password | CampusFix");
  await expect(page.locator('[data-auth-logo="true"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();

  await page.getByRole("button", { name: "Send instructions" }).click();

  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
});

test("register page keeps the compact auth header on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/register");

  await expect(page.locator('[data-auth-logo="true"]')).toHaveCount(1);
  await expect(page.locator('input[name="username"]')).toBeVisible();
});

test("forgot password submits captcha token when verification is enabled", async ({ page }) => {
  let payload = null;

  await page.route("**/api/auth/forgot-password", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "If the account exists, a reset link has been sent.",
      }),
    });
  });

  await page.goto("/forgot-password");
  await expect(page.locator('[data-turnstile-test="true"]')).toBeVisible();

  await page.locator('input[name="email"]').fill("student@example.edu");
  await page.getByRole("button", { name: "Send instructions" }).click();

  await expect.poll(() => payload).not.toBeNull();
  expect(payload).toEqual({
    email: "student@example.edu",
    captchaToken: "playwright-captcha-token",
  });
});

test("verify email page keeps query email visible and explains link verification", async ({ page }) => {
  await page.goto("/verify-email?email=student@example.edu");

  await expect(page).toHaveTitle("Verify email | CampusFix");
  await expect(page.locator('input[name="email"]')).toHaveValue("student@example.edu");
  await expect(page.getByText("verification link")).toHaveCount(2);
  await expect(page.locator('[data-otp-field="true"]')).toHaveCount(0);
});

test("verify email auto-submits a secure token from the query string", async ({ page }) => {
  let payload = null;

  await page.route("**/api/auth/verify-email", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Email verified successfully. You can now sign in.",
      }),
    });
  });

  await page.goto("/verify-email?token=secure-token-123");

  await expect.poll(() => payload).not.toBeNull();
  expect(payload).toEqual({ token: "secure-token-123" });
  await expect(page.getByText("Email verified successfully. You can now sign in.")).toBeVisible();
});

test("verify email resend submits captcha token when verification is enabled", async ({ page }) => {
  let payload = null;

  await page.route("**/api/auth/resend-verification", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "If a pending registration exists, a new verification link has been sent.",
      }),
    });
  });

  await page.goto("/verify-email?email=student@example.edu");
  await expect(page.locator('[data-turnstile-test="true"]')).toBeVisible();

  await page.getByRole("button", { name: "Resend verification link" }).click();

  await expect.poll(() => payload).not.toBeNull();
  expect(payload).toEqual({
    email: "student@example.edu",
    captchaToken: "playwright-captcha-token",
  });
});

test("reset password page handles missing token", async ({ page }) => {
  await page.goto("/reset-password");

  await expect(page).toHaveTitle("Reset link invalid | CampusFix");
  await expect(page.getByText("The reset token is missing or expired.")).toBeVisible();
});

test("accept invite page handles missing token", async ({ page }) => {
  await page.goto("/accept-invite");

  await expect(page).toHaveTitle("Invitation invalid | CampusFix");
  await expect(page.getByText("The invitation token is missing or expired.")).toBeVisible();
});

test("contact support page submits with mocked public APIs", async ({ page }) => {
  await page.route("**/api/catalog/support-categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, label: "Account Access" },
        { id: 2, label: "Ticket Support" },
      ]),
    });
  });
  await page.route("**/api/public/contact-support", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Support request submitted. Our team will reply by email.",
      }),
    });
  });

  await page.goto("/contact-support");

  await expect(page).toHaveTitle("Contact support | CampusFix");
  await expect(page.getByRole("heading", { name: "Contact support" })).toBeVisible();
  await expect(page.getByText("Do not include passwords, one-time codes, or other sensitive credentials.")).toBeVisible();

  await page.locator('input[name="fullName"]').fill("Campus User");
  await page.locator('input[name="email"]').fill("campus@example.edu");
  await page.locator('input[name="subject"]').fill("Need help with account access");
  await page.locator("textarea").fill("I need help updating my account settings before a maintenance request is filed.");
  await page.getByRole("button", { name: "Submit support request" }).click();

  await expect(page.getByText("Support request submitted. Our team will reply by email.")).toBeVisible();
});

test("not found page offers recovery actions", async ({ page }) => {
  await page.goto("/missing-page");

  await expect(page).toHaveTitle("Page not found | CampusFix");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact support" })).toBeVisible();
});

test("auth branding respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");

  const animationName = await page.locator('[data-auth-logo-ring="true"]').first().evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
});
