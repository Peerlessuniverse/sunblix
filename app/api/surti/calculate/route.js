import { NextResponse } from 'next/server';
import { calculateSolarSystem } from '../../../../lib/surti/solarEngine.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { monthlyBill, propertyType, systemType, customRoofArea, location } = body;

    const result = calculateSolarSystem({
      monthlyBill,
      propertyType,
      systemType,
      customRoofArea,
      location,
    });

    return NextResponse.json({
      success: true,
      calculation: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API /api/surti/calculate] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
