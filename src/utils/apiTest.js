// API Connection Test Utility
import { paymentService } from '../service/paymentService'
import { documentService } from '../service/documentService'

export const testApiConnections = async () => {
  console.log('🧪 Testing API Connections...')
  
  const results = {
    payment: { status: 'unknown', error: null },
    document: { status: 'unknown', error: null }
  }

  // Test Payment Service (port 8082)
  try {
    console.log('📦 Testing Payment Service (memberships)...')
    const membershipResponse = await paymentService.getAllMemberships()
    console.log('✅ Payment Service Response:', membershipResponse)
    results.payment.status = 'success'
  } catch (error) {
    console.error('❌ Payment Service Error:', error)
    results.payment.status = 'failed'
    results.payment.error = error.message
  }

  // Test Document Service (port 8084)
  try {
    console.log('📄 Testing Document Service...')
    const documentResponse = await documentService.getPublicDocuments()
    console.log('✅ Document Service Response:', documentResponse)
    results.document.status = 'success'
  } catch (error) {
    console.error('❌ Document Service Error:', error)
    results.document.status = 'failed'
    results.document.error = error.message
  }

  console.log('🏁 API Test Results:', results)
  return results
}

export const displayApiStatus = (results) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅'
      case 'failed': return '❌'
      default: return '⏳'
    }
  }

  console.log('\n🚀 API Connection Status:')
  console.log(`${getStatusIcon(results.payment.status)} Payment Service (Port 8082): ${results.payment.status}`)
  if (results.payment.error) console.log(`   Error: ${results.payment.error}`)
  
  console.log(`${getStatusIcon(results.document.status)} Document Service (Port 8084): ${results.document.status}`)
  if (results.document.error) console.log(`   Error: ${results.document.error}`)
}