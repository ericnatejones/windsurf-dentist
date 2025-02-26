'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-xl font-bold text-blue-600">Dentist Sherpa</span>
            <p className="mt-4 text-gray-600 max-w-md">
              Helping patients find the perfect dentist and enabling dental practices to grow their business.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">For Patients</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900">
                  Find a Dentist
                </Link>
              </li>
              <li>
                <Link href="/insurance" className="text-gray-600 hover:text-gray-900">
                  Insurance Info
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                  Dental Health Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">For Dentists</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/claim" className="text-gray-600 hover:text-gray-900">
                  Claim Your Profile
                </Link>
              </li>
              <li>
                <Link href="/boost" className="text-gray-600 hover:text-gray-900">
                  Boost Your Listing
                </Link>
              </li>
              <li>
                <Link href="/dentist-resources" className="text-gray-600 hover:text-gray-900">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Dentist Sherpa. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-900 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-900 text-sm">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
