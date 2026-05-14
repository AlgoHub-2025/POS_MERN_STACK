import { Request, Response } from 'express';
import { employeeService, CreateEmployeeData, UpdateEmployeeData, EmployeeSearchOptions } from '../services/employeeService';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Create a new employee
 */
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employeeData: CreateEmployeeData = req.body;
    const createdBy = req.user?.id || 'system';

    const employee = await employeeService.createEmployee(employeeData, createdBy);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employee by ID
 */
export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.getEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update employee
 */
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const updateData: UpdateEmployeeData = req.body;
    const updatedBy = req.user?.id || 'system';

    const employee = await employeeService.updateEmployee(employeeId, updateData, updatedBy);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete employee (soft delete)
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const deletedBy = req.user?.id || 'system';

    const success = await employeeService.deleteEmployee(employeeId, deletedBy);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search employees with filters
 */
export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const options: EmployeeSearchOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc',
      department: req.query.department as string,
      position: req.query.position as string,
      jobLevel: req.query.jobLevel as string,
      employmentStatus: req.query.employmentStatus as string,
      contractType: req.query.contractType as string,
      workLocation: req.query.workLocation as string,
      reportingManager: req.query.reportingManager as string,
      skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      includeDeleted: req.query.includeDeleted === 'true'
    };

    const result = await employeeService.searchEmployees(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add performance review
 */
export const addPerformanceReview = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const reviewData = req.body;
    const reviewerId = req.user?.id || 'system';

    const employee = await employeeService.addPerformanceReview(employeeId, reviewData, reviewerId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Performance review added successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add training record
 */
export const addTrainingRecord = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const trainingData = req.body;

    const employee = await employeeService.addTrainingRecord(employeeId, trainingData);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Training record added successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add time off request
 */
export const addTimeOffRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const requestData = req.body;

    const employee = await employeeService.addTimeOffRequest(employeeId, requestData);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Time off request added successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Approve time off request
 */
export const approveTimeOffRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, requestId } = req.params;
    const approvedBy = req.user?.id || 'system';

    const employee = await employeeService.approveTimeOffRequest(employeeId, requestId, approvedBy);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee or request not found'
      });
    }

    res.json({
      success: true,
      message: 'Time off request approved successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reject time off request
 */
export const rejectTimeOffRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, requestId } = req.params;
    const { rejectionReason } = req.body;
    const rejectedBy = req.user?.id || 'system';

    const employee = await employeeService.rejectTimeOffRequest(employeeId, requestId, rejectionReason, rejectedBy);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee or request not found'
      });
    }

    res.json({
      success: true,
      message: 'Time off request rejected successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update employee skill
 */
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const skillData = req.body;

    const employee = await employeeService.updateSkill(employeeId, skillData);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employees by department
 */
export const getEmployeesByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const employees = await employeeService.getEmployeesByDepartment(department);

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employees by manager
 */
export const getEmployeesByManager = async (req: Request, res: Response) => {
  try {
    const { managerId } = req.params;
    const employees = await employeeService.getEmployeesByManager(managerId);

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get active employees
 */
export const getActiveEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getActiveEmployees();

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Import employees from CSV
 */
export const importEmployees = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { skipDuplicates, updateExisting } = req.body;
    const createdBy = req.user?.id || 'system';

    // Parse CSV file
    const employeesData: any[] = [];
    const readable = new Readable();
    readable.push(req.file.buffer);
    readable.push(null);

    await new Promise((resolve, reject) => {
      readable
        .pipe(csv())
        .on('data', (data) => {
          // Transform CSV data to match employee schema
          const transformedData = {
            firstName: data.firstName || data.first_name,
            lastName: data.lastName || data.last_name,
            middleName: data.middleName || data.middle_name,
            preferredName: data.preferredName || data.preferred_name,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            gender: data.gender,
            maritalStatus: data.maritalStatus || data.marital_status,
            dependents: data.dependents ? parseInt(data.dependents) : 0,
            email: data.email,
            alternateEmail: data.alternateEmail || data.alternate_email,
            phone: data.phone,
            alternatePhone: data.alternatePhone || data.alternate_phone,
            employment: {
              hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
              contractType: data.contractType || data.contract_type || 'full_time',
              probationEndDate: data.probationEndDate ? new Date(data.probationEndDate) : undefined,
              noticePeriod: data.noticePeriod ? parseInt(data.noticePeriod) : 30,
              workSchedule: {
                type: data.scheduleType || data.schedule_type || 'fixed',
                days: data.scheduleDays ? data.scheduleDays.split(',') : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                hours: {
                  start: data.scheduleStart || data.schedule_start || '09:00',
                  end: data.scheduleEnd || data.schedule_end || '17:00',
                  break: data.scheduleBreak ? parseInt(data.scheduleBreak) : 60
                }
              },
              workLocation: {
                type: data.workLocation || data.work_location || 'onsite',
                primaryLocation: data.primaryLocation || data.primary_location || 'Main Office'
              },
              reportingManager: data.reportingManager || data.reporting_manager,
              department: data.department,
              position: data.position,
              jobLevel: data.jobLevel || data.job_level,
              jobFamily: data.jobFamily || data.job_family,
              costCenter: data.costCenter || data.cost_center
            },
            compensation: {
              currency: data.currency || 'USD',
              payFrequency: data.payFrequency || data.pay_frequency || 'monthly',
              baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : undefined,
              hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
              overtimeRate: data.overtimeRate ? parseFloat(data.overtimeRate) : undefined
            }
          };

          employeesData.push(transformedData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const result = await employeeService.importEmployees(employeesData, {
      skipDuplicates: skipDuplicates === 'true',
      updateExisting: updateExisting === 'true',
      createdBy
    });

    res.json({
      success: true,
      message: 'Import completed',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Export employees to CSV
 */
export const exportEmployees = async (req: Request, res: Response) => {
  try {
    const options: EmployeeSearchOptions = {
      department: req.query.department as string,
      position: req.query.position as string,
      jobLevel: req.query.jobLevel as string,
      employmentStatus: req.query.employmentStatus as string,
      contractType: req.query.contractType as string,
      workLocation: req.query.workLocation as string,
      reportingManager: req.query.reportingManager as string,
      skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      includeDeleted: req.query.includeDeleted === 'true'
    };

    const employees = await employeeService.exportEmployees(options);

    // Convert to CSV
    const csvHeaders = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Position',
      'Job Level',
      'Employment Status',
      'Contract Type',
      'Hire Date',
      'Base Salary',
      'Hourly Rate',
      'Work Location',
      'Reporting Manager',
      'Created At',
      'Is Active'
    ];

    const csvRows = employees.map(employee => [
      employee.employeeId,
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.phone,
      employee.department,
      employee.position,
      employee.jobLevel,
      employee.employmentStatus,
      employee.contractType,
      employee.hireDate,
      employee.baseSalary || '',
      employee.hourlyRate || '',
      employee.workLocation,
      employee.reportingManager || '',
      employee.createdAt,
      employee.isActive
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employee analytics
 */
export const getEmployeeAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const analytics = await employeeService.getEmployeeAnalytics(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update employee performance metrics
 */
export const updatePerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const metrics = req.body;

    const employee = await employeeService.updatePerformanceMetrics(employeeId, metrics);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Performance metrics updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employee directory
 */
export const getEmployeeDirectory = async (req: Request, res: Response) => {
  try {
    const { department, includeInactive } = req.query;

    const directory = await employeeService.getEmployeeDirectory({
      department: department as string,
      includeInactive: includeInactive === 'true'
    });

    res.json({
      success: true,
      data: directory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get upcoming birthdays
 */
export const getUpcomingBirthdays = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const birthdays = await employeeService.getUpcomingBirthdays(days);

    res.json({
      success: true,
      data: birthdays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get work anniversaries
 */
export const getWorkAnniversaries = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const anniversaries = await employeeService.getWorkAnniversaries(days);

    res.json({
      success: true,
      data: anniversaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employee performance reviews
 */
export const getPerformanceReviews = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.getEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee.performanceReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employee training records
 */
export const getTrainingRecords = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.getEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee.trainingRecords.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get employee time off requests
 */
export const getTimeOffRequests = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const employee = await employeeService.getEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee.timeOffRequests.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      )
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all controllers
export {
  upload
};
