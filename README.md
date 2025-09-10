# NaiUdaan Library Frontend

A modern, responsive web application for managing the NaiUdaan Library, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Admin Authentication**: Secure login for library administrators.
- **Dashboard**: Visual overview of total students, available seats, expiring subscriptions, and active students.
- **Student Management**: Register new students, view all students, edit details, delete records, and filter/search students.
- **Seat Management**: Visual seat layout for sections A and B, allocate/deallocate seats, mark seats for maintenance, and view seat statistics.
- **Subscription Plans**: Create, update, and manage subscription plans; view active/inactive plans and subscriber counts.
- **Fee Management**: Track fee status (Paid, Pending, Overdue) for each student.
- **Expiring Subscriptions**: View students whose subscriptions are expiring soon.
- **Notifications**: User-friendly notifications for all major actions (success/error).
- **Responsive UI**: Works seamlessly on desktop and mobile devices.
- **Aesthetic Home Page**: Includes a gallery, location map, services offered, and contact information.
- **Accessibility**: Follows accessibility best practices for forms and navigation.

## Tech Stack

- **React** (with hooks)
- **TypeScript**
- **Vite** (for fast development and build)
- **Tailwind CSS** (utility-first styling)
- **Lucide React** (icon library)
- **React Router** (for navigation)
- **Context API** (for authentication state)

## Folder Structure

```
src/
  components/
    Auth/           # Login and authentication views
    Dashboard/      # Dashboard and stats cards
    Home/           # Home page, navbar, gallery, services, contact
    Layout/         # Header, Sidebar
    Plans/          # Subscription plan management
    Registration/   # Student registration
    Seats/          # Seat management
    Students/       # Student list and management
  services/
    api.ts          # API service layer
  types/
    api.ts          # TypeScript interfaces
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

- Configure your backend API URL in `src/services/api.ts` (`BASE_URL`).
- Ensure your backend supports CORS for local development.

## Credits & Collaborators

[ayushkumar320](https://github.com/ayushkumar320)
[mobi2400](https://github.com/mobi2400)

## License

This project is for educational and non-commercial use. Please contact the owner for other uses.

---

For any issues or contributions, please open an issue or pull request on GitHub.
