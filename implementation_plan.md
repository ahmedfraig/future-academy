# Implementation Plan for UI/UX & Responsive Fixes

## 1. Global / Theming Fixes (index.css & Shared Components)
- **Custom Scrollbars:** Add global CSS to `index.css` to style webkit scrollbars with a premium theme color (e.g., violet/indigo) instead of plain browser defaults.
- **Loading Skeletons:** Create a new `Skeleton` or `LoadingSpinner` component and apply it globally anywhere "جاري تحميل..." is currently used as plain text.

## 2. Parent Account UX Improvements
- **Desktop "Mobile Container":** Update the main layout wrapper for parents so it uses standard desktop responsive margins rather than squishing to a mobile column in the center.
- **Bottom Navigation Semantics:** Ensure the `التقرير اليومي` and `الملاحظات` items are proper buttons/links for better accessibility.
- **My Account Details:**
  - Fix the RTL spacing issue where labels (left) and values (right) are too deeply disconnected in the table. Keep them unified.
  - Fix top padding overlap in the profile card header.
- **Daily Report:** Replace plain text empty states.
- **Notes Page:** Fix visual hierarchy of header versus note box length, fix mobile textarea width.

## 3. Teacher Account UX Improvements
- **Responsive Layouts:**
  - Fix the "Subject, Description, Homework" single row inputs to stack on mobile (`flex-col md:flex-row`).
  - Improve the gap for header buttons to avoid wrapping or overlapping.
  - Correct the "التقييم العام" assessment buttons to wrap nicely on mobile so they don't overflow the container in the Student modal.
- **Design & Contrast:**
  - Enhance visibility of the "💾 حفظ" button (which currently looks grey/disabled).
  - Darken the "trash" and "check" icons in list items for better contrast.
  - Ensure the "غائب" status pill has a richer shade of red.
  - Fix emoji opacities in modaled forms to be visible.

## 4. Manager Account UX Improvements
- **Action Buttons & Tables:**
  - Increase padding/size of "Edit/Delete/Invite" buttons in the Students table to make touch targets better on mobile.
  - Implement a mobile-friendly wrap for the Students table (horizontal scroll or card-based view).
  - Improve contrast of table headers.
- **Modals & Grids:**
  - Fix modal scaling on mobile to remove unnecessary padding/margins causing sideways layouts stringency.
  - Fix the Transfer Students selection grid causing extreme narrow icon squishing on small widths.
- **Dashboard aesthetics:** Check the icon-to-text proportion on the home widgets to make them more balanced.

## User Review Required
Please review the above list. These represent all the UI and responsive issues the automated inspection found. If you approve, I will begin implementing these polish fixes sequentially.
